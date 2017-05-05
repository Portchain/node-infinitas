
function Job(id) {
  this.id = id
}

Job.prototype.done = function(callback) {
  this._scheduler.endJob(this.id, callback)
}

Job.prototype.fail = function(callback) {
  this._scheduler.failJob(this.id, callback)
}

Job.prototype.log = function(message, callback) {
  this._scheduler.logJob(this.id, new Date(), message, (err) => {
    if(callback) {
      callback(err)
    }
  })
}

module.exports = Job
