
var assert = require('assert')

var Infinitas = require('../Infinitas.js')


describe('runtime', function() {

  it('cron', function(done) {

    this.timeout(2000)

    var sonic = new Infinitas()


    sonic.schedule('task1', '* * * * * *')

    sonic.setProcessor('task1', function(task, schedule, jobId) {

      sonic.setProcessor('task1', null)

      assert.equal(task.name, 'task1')
      done()
    })
  })

  it('interval', function(done) {

    this.timeout(1000)

    var sonic = new Infinitas()

    sonic.schedule('task2', 500)

    sonic.setProcessor('task2', function(task, schedule, jobId) {
      sonic.setProcessor('task2', null)
      assert.equal(task.name, 'task2')
      done()
    })
  })

})
