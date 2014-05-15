
var _                = require('underscore')
var Timeout          = require('timeout-scheduler')
var JobContext       = require('./lib/JobContext.js')
var MemoryStore      = require('./lib/store/MemoryStore.js')
var FileSystemStore  = require('./lib/store/FileSystemStore.js')

function Scheduler(options) {

  options = options || {}

  this._store = options.store || new Scheduler.STORE.MemoryStore()
  this._interval = options.interval || 100
  this._timeout = new Timeout()
  this._processors = {}

  var self = this
  this._checkNextBinded = function() {
    self._checkNext()
  }

  this._checkNext()
}

Scheduler.STORE = {
  MemoryStore      : MemoryStore,
  FileSystemStore  : FileSystemStore
}


/** Schedule a new job
 *
 * @callback(err, scheduleId)
 */
Scheduler.prototype.schedule = function(taskOrTaskName, scheduleOrCallback, callback) {
  if(!callback && _.isFunction(scheduleOrCallback)) {
    callback = scheduleOrCallback
    this._store.saveTask(taskOrTaskName, function(err, taskId) {
      if(callback) { callback(err, task, undefined) }
    })
  } else {
    this._store.addSchedule(taskOrTaskName, scheduleOrCallback, function(err, scheduleId) {
      if(callback) { callback(err, task, scheduleId) }
    })
  }
}

/** Retrieve the schedule information of a given job
 *
 */
Scheduler.prototype.getTask = function(taskName, callback) {
  throw new Error('not implemented')
}

/** Remove the schedule information of a given job
 *
 */
Scheduler.prototype.unchedule = function(taskName, schedule, callback) {
  throw new Error('not implemented')
}

Scheduler.prototype._checkNext = function() {

  var self = this

  // TODO: optimize by not checking tasks that don't have a processor
  this._store.nextJob(function(err, task, schedule, jobId) {

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

Scheduler.prototype.setProcessor = function(taskName, processor) {
  // yes, this may replace an existing processor.
  // We do want only one processor per task.
  this._processors[taskName] = processor
}

Scheduler.prototype._runJob = function(task, schedule, jobId, callback) {

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

module.exports = Scheduler
