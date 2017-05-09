
const logger = require('logacious')()
const Job = require('./Job.js')
const EventEmitter = require('events').EventEmitter
const cron = require('cron-parser')
const util = require('util')
const moment = require('moment')

function Scheduler(dbConf, pollDB) {

  this._db = require('./DB.js')(dbConf)
  
  EventEmitter.call(this)
  this.createJob = this.createJob.bind(this)
  if(pollDB) {
    this._dbPollDelay = 100
    this._initialize()
  }
}

util.inherits(Scheduler, EventEmitter)

Scheduler.prototype._initialize = function() {
  this._db.fetchNextScheduledTasks((err, nextTasks) => {
    if(err) {
      logger.error(err)
      process.exit(1)
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
  logger.info(`Upserting task ${task.name}`)
  let nextJobDate = getNextJobDate(task)
  let enabled = task.hasOwnProperty('enabled') ? !!task.enabled : true
  this._db.upsertTask(task.name,
                task.schedule,
                task.timeout,
                nextJobDate,
                enabled,
                (err) => {
                  callback(err)
                })
}

Scheduler.prototype.unscheduleTask = function(taskName, callback) {
  logger.info(`Unscheduling task ${taskName}`)
  this._db.disableTask(taskName, (err) => {
    callback(err)
  })
}

Scheduler.prototype.createJob = function(task) {
  this._db.createJob(task.name, getNextJobDate(task), (err, result) => {
    if(err) {
      logger.error(err)
    } else {
      let job = new Job(result[0].id, task.timeoutMs)
      logger.info(`Triggering job ${task.name}.${job.id}`)
      job._scheduler = this
      this.emit('job', task.name, job)
    }
  })
}

Scheduler.prototype.endJob = function(jobId, callback) {
  this._db.endJob(jobId, (err) => {
    callback(err)
  })
}

Scheduler.prototype.failJob = function(jobId, callback) {
  this._db.failJob(jobId, (err) => {
    callback(err)
  })
}

Scheduler.prototype.logJob = function(jobId, date, message, callback) {
  this._db.logJob(jobId, date, message, (err) => {
    callback(err)
  })
}

Scheduler.prototype.searchTasks = function(searchTerm, from, to, pageSize, callback) {
  this._db.searchTasks((err, tasks) => {
    callback(err, tasks)
  })
}

Scheduler.prototype.fetchTask = function(taskName, callback) {
  logger.info('Fetching task', taskName)
  this._db.fetchTask(taskName, (err, result) => {
    callback(err, result ? result[0] : null)
  })
}

Scheduler.prototype.dropTask = function(taskName, callback) {
  logger.info(`Dropping task ${taskName}`)
  this._db.dropTask(taskName, (err) => {
    callback(err)
  })
}

module.exports = Scheduler
