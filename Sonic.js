
var _                = require('underscore')
var Timeout          = require('timeout-scheduler')
var JobContext       = require('./lib/JobContext.js')
var MemoryStore      = require('./lib/persistence/MemoryStore.js')
var FileSystemStore  = require('./lib/persistence/FileSystemStore.js')

function Sonic(options) {

  options = options || {}

  this._persistence = options.persistence || new Sonic.STORE.MemoryStore()
  this._interval = options.interval || 100
  this._timeout = new Timeout()
  this._processors = {}

  var self = this
  this._checkNextBinded = function() {
    self._checkNext()
  }

  this._checkNext()
}

Sonic.STORE = {
  MemoryStore      : MemoryStore,
  FileSystemStore  : FileSystemStore
}


/** Schedule a new job
 *
 * @callback(err, scheduleId)
 */
Sonic.prototype.schedule = function(taskOrTaskName, scheduleOrCallback, callback) {
  if(!callback && _.isFunction(scheduleOrCallback)) {
    callback = scheduleOrCallback
    this._persistence.saveTask(taskOrTaskName, function(err, taskId) {
      if(callback) { callback(err, task, undefined) }
    })
  } else {
    this._persistence.addSchedule(taskOrTaskName, scheduleOrCallback, function(err, scheduleId) {
      if(callback) { callback(err, task, scheduleId) }
    })
  }
}

/** Retrieve the schedule information of a given job
 *
 */
Sonic.prototype.getTask = function(taskName, callback) {
  throw new Error('not implemented')
}

/** Remove the schedule information of a given job
 *
 */
Sonic.prototype.unchedule = function(taskName, schedule, callback) {
  throw new Error('not implemented')
}

Sonic.prototype._checkNext = function() {

  var self = this

  // TODO: optimize by not checking tasks that don't have a processor
  this._persistence.nextJob(function(err, task, schedule, jobId) {

    if(err) {

      console.error(err)
      setTimeout(self._checkNextBinded, self._interval)

    } else if(jobId) {

      self._runJob(task, schedule, jobId, function() {
        setTimeout(self._checkNextBinded, self._interval)
      })

    } else {

      setTimeout(self._checkNextBinded, self._interval)

    }

  })
}


Sonic.prototype.setProcessor = function(taskName, processor) {
  // yes, this may replace an existing processor.
  // We do want only one processor per task.
  this._processors[taskName] = processor
}

Sonic.prototype._runJob = function(task, schedule, jobId, callback) {

  var processor = this._processors[task.name]

  if(processor) {

    var jobCtx = new JobContext(task, schedule, jobId, processor)


    task.lastRun = {
      id: task._jobId,
      date: new Date()
    }
    // TODO: save task status

    jobCtx.execute(function() {
      // TODO: save task status
      callback()
    })
  }
}

module.exports = Sonic
