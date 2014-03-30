
var uuid           = require('uuid')
var parser         = require('cron-parser')
var _              = require('underscore')
var ScheduleHelper = require('../ScheduleHelper.js')

function Task(name, schedules) {
  this._name = name
  this._schedules = schedules || []

}

Task.prototype.schedules = function() {
  // TODO: deep clone
  return _.clone(this._schedules)
}

Task.prototype.schedule = function(schedulePrimitive) {

  assert.ok(schedule, 'schedulePrimitive is required')

  if(_.isString(schedule)) {
    schedule = {
      type: 'cron',
      data: schedule
    }
  } else if(_.isNumber(schedule)) {
    schedule = {
      type: 'interval',
      data: Number(schedule)
    }
  } else {
    throw new Error('unrecognised schedule format: ' + schedule))
  }

  schedule.id = uuid.v4()

  switch(schedule.type) {
    case 'cron':
      schedule.cron = parser.parseExpressionSync(schedule.data)
      break
    case 'interval':
      break
    default:
      //TODO: throw
      break
  }

  var task = this._tasks[taskName]
  if(!task) {
    task = this._tasks[taskName] = {
      name: taskName,
      lastRun: {
        id: -1,
        date: new Date()
      }
    }
  }

  if(!task.schedules) {
    task.schedules = []
  }

  for(var i = 0 ; i < task.schedules.length ; i++) {
    if(task.schedules[i].type === schedule.type && task.schedules[i].data === schedule.data) {
      return setImmediate(function() {
        console.warn('schedule already exists')
        callback(undefined, schedule)
      })
    }
  }

  task.schedules.push(schedule)

  setImmediate(function() {
    callback(undefined, schedule)
  })
}

Task.prototype.unschedule = function(schedule) {

  assert.ok(schedule, 'schedule is required')


  for(var i = 0 ; i < this._schedules.length ; i++) {
    if( task.schedules[i].data === schedule ||
       (schedule.hasOwnProperty('data') && this._schedules[i].data === schedule.data)) {
      var schedule = this._schedules.splice(i, 1)
      return schedule
    }
  }

}

Task.prototype.next = function() {

  for(var taskName in this._tasks) {
    var task = this._tasks[taskName]

    var schedule = ScheduleHelper.shouldRunNow(task)

    if(schedule) {
      return setImmediate(function() {

        if(!task._jobId) {
          task._jobId = 0
        }

        task._jobId ++

        callback(undefined, task, schedule, task._jobId)
      })
    }

  }

  callback(undefined, undefined, undefined, undefined)
}

module.exports = Task
