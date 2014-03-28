var util             = require("util")
var EventEmitter     = require("events").EventEmitter

var MemoryStore      = require('./lib/persistence/MemoryStore.js')
var FileSystemStore  = require('./lib/persistence/FileSystemStore.js')


function Sonic(options) {
  EventEmitter.call(this);
  this._persistence = options.persistence || new Sonic.STORE.MemoryStore()
  this._interval = options.interval || 5000

  var self
  this._checkNextBinded = function() {
    self._checkNext()
  }
}

util.inherits(Sonic, EventEmitter)

Sonic.STORE = {
  MemoryStore: MemoryStore,
  FileSystemStore: FileSystemStore
}


/** Schedule a new job
 *
 * @callback(err, scheduleId)
 */
Sonic.prototype.schedule = function(taskOrTaskName, scheduleOrCallback, callback) {
  if(!callback) {
    callback = scheduleOrCallback
    this._persistence.saveTask(taskOrTaskName, function(err, taskId) {
      callback(err, task, undefined)
    })
  } else {
    this._persistence.addSchedule(taskOrTaskName, scheduleOrCallback, function(err, scheduleId) {
      callback(err, task, scheduleId)
    })
  }
}

/** Retrieve the schedule information of a given job
 *
 */
Sonic.prototype.getTask = function(taskName, callback) {

}

/** Remove the schedule information of a given job
 *
 */
Sonic.prototype.unchedule = function(taskName, schedule, callback) {

}

Sonic.prototype._checkNext = function() {

  var self = this

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

Sonic.prototype._runJob = function(task, schedule, jobId, callback) {

}

module.exports = Sonic
