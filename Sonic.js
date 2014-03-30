
var kue              = require('kue')
var _                = require('underscore')
var Timeout          = require('timeout-scheduler')
var JobContext       = require('./lib/JobContext.js')
var MemoryStore      = require('./lib/persistence/MemoryStore.js')
var FileSystemStore  = require('./lib/persistence/FileSystemStore.js')

function Sonic(options) {

  options = options || {}
  this._interval = options.interval || 100
  this._timeout = new Timeout()
  this._processors = {}
  this._queue = kue.createQueue()

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


Sonic.prototype.setProcessor = function(taskName, processor) {
  // yes, this may replace an existing processor.
  // We do want only one processor per task.
  this._processors[taskName] = processor
}

module.exports = Sonic
