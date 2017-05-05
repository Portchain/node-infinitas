
const Scheduler = require('./lib/Scheduler.js')
const migration = require('./lib/migration.js')
const logger = require('logacious')()

function Infinitas(options) {

  options = options || {}
  this._processors = {}

  if(!options.server) {
    migration((err) => {
      if(err) throw err
      this._scheduler = new Scheduler(/*pollDB*/ true)
      this._scheduler.on('job', (taskName, job) => {
        logger.info(`JOB EVENT ${taskName}.${job.id}`, this._processors)
        if(this._processors[taskName]) {
          let processor = this._processors[taskName]
          logger.info(`Running job ${taskName}.${job.id}`)
          processor.call(null, job)
        } else {
          logger.warn(`Could not find any processor for job ${taskName}.${job.id}`)
          job.log('no processor found')
          job.fail((err) => {
            if(err) {
              logger.error(err)
            }
          })
        }
      })

      if(options.onReady) {
        options.onReady()
      }
    })
  }
}

Infinitas.prototype.schedule = function(task, callback) {
  this._scheduler.scheduleTask(task, callback)
}

Infinitas.prototype.unschedule = function(taskName, callback) {
  this._scheduler.unscheduleTask(taskName, callback)
}


Infinitas.prototype.setProcessor = function(taskName, func) {
  this._processors[taskName] = func
}


module.exports = Infinitas
