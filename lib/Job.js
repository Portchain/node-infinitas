
function Job(id, timeout) {
  this.id = id
  if(timeout && timeout > 0) {
    this._timeout = setTimeout(() => {
      this.log(`job timed out after ${timeout}ms`)
      this.fail()
      this._timedOut = true
    }, timeout)
  }
}

function propagateTimeoutError(callback) {
  let err = new Error('The job timed out')
  if(callback) {
    callback(err)
  } else {
    throw err
  }
}

Job.prototype.done = function(callback) {
  if(this._timedOut) {
    propagateTimeoutError(callback)
    return
  }
  this._scheduler.endJob(this.id, (err) => {
    if(callback) {
      callback(err)
    } else if(err) {
      logger.error(err)
    }
  })
}

Job.prototype.fail = function(callback) {
  if(this._timedOut) {
    propagateTimeoutError(callback)
    return
  }
  this._scheduler.failJob(this.id, (err) => {
    if(callback) {
      callback(err)
    } else if(err) {
      logger.error(err)
    }
  })
}

Job.prototype.log = function(message, callback) {
  if(this._timedOut) {
    propagateTimeoutError(callback)
    return
  }
  this._scheduler.logJob(this.id, new Date(), message, (err) => {
    if(callback) {
      callback(err)
    } else if(err) {
      logger.error(err)
    }
  })
}

module.exports = Job
