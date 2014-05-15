
var assert = require('assert')

var Infinitas = require('../Infinitas.js')


describe('runtime', function() {

  it('cron', function(done) {

    this.timeout(2000)

    var infinitas = new Infinitas()


    infinitas.schedule('task1', '* * * * * *')

    infinitas.setProcessor('task1', function(task, schedule, jobId) {

      infinitas.setProcessor('task1', null)

      assert.equal(task.name, 'task1')
      done()
    })
  })

  it('interval', function(done) {

    this.timeout(1000)

    var infinitas = new Infinitas()

    infinitas.schedule('task2', 500)

    infinitas.setProcessor('task2', function(task, schedule, jobId) {
      infinitas.setProcessor('task2', null)
      assert.equal(task.name, 'task2')
      done()
    })
  })

})
