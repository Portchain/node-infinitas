
var uuid           = require('uuid')
var assert         = require('assert')
var _              = require('underscore')

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

module.exports = MemoryStore
