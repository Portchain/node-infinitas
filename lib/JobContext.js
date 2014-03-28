
var STATUS_SUCCESS = 'success'
var STATUS_FAILED  = 'failed'
var STATUS_RUNNING = 'running'
var STATUS_TIMEOUT = 'timeout'
var STATUS_INITIAL = null

function JobContext(task, schedule, jobId, processor) {

  this._task      = task
  this._schedule  = schedule
  this._jobId     = jobId
  this._processor = processor

  this._status    = STATUS_INITIAL
  this._callback  = null
  this._killed    = true
}

JobContext.prototype.execute = function(callback) {
  if(this._callback) {
    throw new Error('job already running')
  }
  this._callback = callback

  var self = this
  this._timeout = setTimeout(function() {
    if(self._status === STATUS_RUNNING) {
      self._status = STATUS_TIMEOUT
      console.error('killing job (timeout)', self._task.name, self._jobId)
      self._callback(new Error(STATUS_TIMEOUT))
    }
  })

  try {
    this._processor.call(this, this._task, this._schedule, this._jobId)
  } catch(err) {
    console.error(err)
    if(this._status === STATUS_RUNNING) {
      this.fail(err)
    }
  }
}

JobContext.prototype.done = function() {
  if(this.status === STATUS_RUNNING) {

    clearTimeout(this._timeout)
    this._status = STATUS_SUCCESS

    // setImmediate is used to not interupt the flow of the job if there is an error in our callback
    setImmediate(this._callback)

  } else if(this._status === STATUS_SUCCESS){

    throw new Error('this.done() can only be called once')

  } else if(this._status === STATUS_FAILED){

    throw new Error('this.done() cannot be called after this.fail()')

  }
}

JobContext.prototype.fail = function(err) {
  if(this.status === STATUS_RUNNING) {

    clearTimeout(this._timeout)
    this._status = STATUS_FAILED
    this._error  = err

    // setImmediate is used to not interupt the flow of the job if there is an error in our callback
    setImmediate(function() {
      this._callback(err)
    })

  } else if(this._status === STATUS_FAILED){

    throw new Error('this.fail() can only be called once')

  } else if(this._status === STATUS_SUCCESS){

    throw new Error('this.fail() cannot be called after this.done()')

  }
}

JobContext.prototype.progress = function() {
  console.warn('this.progress() is not implemented yet')
}

module.exports = JobContext
