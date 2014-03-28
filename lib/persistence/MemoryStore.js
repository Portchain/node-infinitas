
var uuid           = require('uuid')
var cron           = require('cron')
var assert         = require('assert')
var _              = require('underscore')
var parser         = require('cron-parser')
var ScheduleHelper = require('../ScheduleHelper.js')

function MemoryStore() {
  this._tasks = {}
}

MemoryStore.prototype.saveTask = function(task, callback) {
  assert.ok(task,      'task is required')
  assert.ok(task.name, 'task name is required')

  this._tasks[task.name] = task

  setImmediate(callback)

}

MemoryStore.prototype.getTask = function(taskName, callback) {

  var task = this._tasks[task.name]

  setImmediate(function() {
    callback(undefined, task)
  })

}

MemoryStore.prototype.addSchedule = function(taskName, schedule, callback) {
  assert.ok(schedule               , 'schedule is required')

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
  } else if(!_.isObject(schedule)){
    return setImmediate(function() {
      callback(new Error('unrecognised schedule format: ' + schedule))
    })
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
        console.log('schedule already exists')
        callback()
      })
    }
  }

  task.schedules.push(schedule)

  setImmediate(function() {
    callback(undefined, schedule.id)
  })
}

MemoryStore.prototype.removeSchedule = function(taskName, schedule, callback) {
  assert.ok(schedule               , 'schedule is required')


  var task = this.task[taskName]
  if(task) {

    if(!task.schedules) {
      task.schedules = []
    }

    for(var i = 0 ; i < task.schedules.length ; i++) {
      if( task.schedules[i].data === schedule ||
         (schedule.hasOwnProperty('data') && task.schedules[i].data === schedule.data)) {
        var schedule = task.schedules.splice(i, 1)
        return setImmediate(function() {
          callback(undefined, schedule)
        })
      }
    }

    task.schedules.push(schedule)

  } else {
    setImmediate(function() {
      callback(new Error('no such task ['+taskName+']'))
    })
  }
}

MemoryStore.prototype.nextJob = function(callback) {

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

module.exports = MemoryStore
