
const logger = require('logacious')()
const db = require('./DB.js')()
const Job = require('./Job.js')
const EventEmitter = require('events').EventEmitter
const cron = require('cron-parser')
const util = require('util')

function Scheduler(pollDB) {
  EventEmitter.call(this)
  this.createJob = this.createJob.bind(this)
  if(pollDB) {
    this._dbPollDelay = 100
    this._initialize()
  }
}

util.inherits(Scheduler, EventEmitter)

Scheduler.prototype._initialize = function() {
  db.fetchNextScheduledTasks((err, nextTasks) => {
    if(err) {
      logger.error(err)
    } else if(nextTasks && nextTasks.length > 0) {
      logger.info(`Scheduler found ${nextTasks.length} tasks to run immediately.`)
      nextTasks.forEach(this.createJob)
    }
    setTimeout(() => {
      this._initialize()
    }, this._dbPollDelay)
  })
}

function getNextJobDate(task) {
  let cronTimer = cron.parseExpression(task.schedule, {currentDate: new Date()})
  return cronTimer.next().toDate()
}

Scheduler.prototype.scheduleTask = function(task, callback) {
  logger.info(`Scheduling new task ${task.name}`)
  db.createTask(task.name,
                task.schedule,
                task.timeout,
                getNextJobDate(task),
                (err) => {
                  callback(err)
                })
}

Scheduler.prototype.unscheduleTask = function(taskName, callback) {
  logger.info(`Unscheduling task ${taskName}`)
  db.disableTask(taskName, (err) => {
    callback(err)
  })
}

Scheduler.prototype.createJob = function(task) {
  db.createJob(task.name, getNextJobDate(task), (err, result) => {
    if(err) {
      logger.error(err)
    } else {
      let job = new Job(result[0].id)
      logger.info(`Triggering job ${task.name}.${job.id}`)
      job._scheduler = this
      this.emit('job', task.name, job)
    }
  })
}

Scheduler.prototype.endJob = function(jobId, callback) {
  db.endJob(jobId, (err) => {
    callback(err)
  })
}

Scheduler.prototype.failJob = function(jobId, callback) {
  db.failJob(jobId, (err) => {
    callback(err)
  })
}

Scheduler.prototype.logJob = function(jobId, date, message, callback) {
  db.logJob(jobId, date, message, (err) => {
    callback(err)
  })
}

Scheduler.prototype.searchTasks = function(searchTerm, from, to, pageSize, callback) {
  db.searchTasks((err, tasks) => {
    callback(err, tasks)
  })
}

Scheduler.prototype.fetchTask = function(taskName, callback) {
  logger.info('Fetching task', taskName)
  db.fetchTask(taskName, (err, result) => {
    callback(err, result ? result[0] : null)
  })
}

Scheduler.prototype.dropTask = function(taskName, callback) {
  logger.info(`Dropping task ${taskName}`)
  db.dropTask(taskName, (err) => {
    callback(err)
  })
}

module.exports = Scheduler
