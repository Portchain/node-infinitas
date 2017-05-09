
function Job(id, timeout) {
  this.id = id
  if(timeout && timeout > 0) {
    this._timeout = setTimeout(() => {
      this.log(`job timed out after ${timeout}ms`)
      this.fail()
    }, timeout)
  }
}

Job.prototype.done = function(callback) {
  if(!callback) {
    callback = () => {}
  }
  this._scheduler.endJob(this.id, callback)
}

Job.prototype.fail = function(callback){ 
  if(!callback) {
    callback = () => {}
  }
  this._scheduler.failJob(this.id, callback)
}

Job.prototype.log = function(message, callback) {
  if(!callback) {
    callback = () => {}
  }
  this._scheduler.logJob(this.id, new Date(), message, callback)
}

module.exports = Job
