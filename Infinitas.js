
const Scheduler = require('./lib/Scheduler.js')
const migration = require('./lib/migration.js')
const logger = require('logacious')()

const server = require('./lib/Server.js')

function Infinitas(options) {

  options = options || {}
  this._processors = {}

  if(!options.server) {
    server((err) => {
      if(err) {
        logger.error(err)
        process.exit(1)
      }

      this._scheduler = new Scheduler(/*pollDB*/ true)
      this._scheduler.on('job', (taskName, job) => {
        logger.info(`Job triggered ${taskName}.${job.id}`)
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

Infinitas.prototype.dropTask = function(taskName, callback) {
  this._scheduler.dropTask(taskName, callback)
}

Infinitas.prototype.fetchTask = function(taskName, callback) {
  this._scheduler.fetchTask(taskName, callback)
}


Infinitas.prototype.setProcessor = function(taskName, func) {
  this._processors[taskName] = func
}






if(require.main === module) {
  new Infinitas()
} else {
  module.exports = Infinitas
}
