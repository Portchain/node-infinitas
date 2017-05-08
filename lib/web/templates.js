
const app = require('express').Router()
const Scheduler = require('../Scheduler.js')

let scheduler = new Scheduler()

app.get('/', function(req, res) {
  res.redirect('/tasks')
})
        
app.get('/tasks', function(req, res) {
  scheduler.searchTasks(null, null, null, null, (err, tasks) => {
    res.render('tasks.dust', {
      tasks
    })
  })
})
        
app.get('/task/:taskName', function(req, res) {
  scheduler.fetchTask(req.params.taskName, (err, task) => {
    res.render('taskDetails.dust', {
      task
    })
  })
})

module.exports = app
