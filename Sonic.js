var util         = require("util")
var EventEmitter = require("events").EventEmitter

var FileSystem   = require('./lib/persistence/FileSystem.js')


function Sonic(options) {
  EventEmitter.call(this);
  this._persistence = options.persistence || new FileSystem()


}

util.inherits(Sonic, EventEmitter)

/** Schedule a new job
 *
 * @callback(err, scheduleId)
 */
Sonic.prototype.schedule = function(jobName, schedule, callback) {

}

/** Retrieve the schedule information of a given job
 *
 */
Sonic.prototype.getSchedule = function(jobName, callback) {

}

/** Remove the schedule information of a given job
 *
 */
Sonic.prototype.removeSchedule = function(jobName, scheduleId, callback) {

}


module.exports = Sonic
