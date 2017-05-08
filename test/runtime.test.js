
const assert = require('assert')
const crypto = require('crypto')
const Infinitas = require('../Infinitas.js')
const logger = require('logacious')()


describe('runtime', function() {

  let infinitas
  let testId = 'test-' + crypto.randomBytes(3).toString('hex')

  before((done) => {
    infinitas = new Infinitas({
      onReady: done
    })
  })

  it('schedule task', function(done) {
    this.timeout(6000)
    infinitas.schedule({
      name: testId,
      schedule: '*/1 * * * * *',
      timeout: 10000
    }, (err) => {
      done(err)
    })
  })

  it('register a processor', function(done) {
    infinitas.setProcessor(testId, job => {
      job.log('hello world')
      job.done((err) => {
        done(err)
      })
    })
  })

  it('unschedule the task', function(done) {
    infinitas.unschedule(testId, done)
  })

  it('unregister a processor', function(done) {
    infinitas.setProcessor(testId, null) // disable
    setTimeout(done, 1500)
  })
  
  it('Check the task has the proper logs', function(done) {
    infinitas.fetchTask(testId, (err, task) => {
      assert.ok(!err, err ? err.stack : '')
      assert.ok(task)
      assert.ok(task.jobs)
      assert.equal(task.jobs.length, 1)
      assert.ok(task.jobs[0])
      assert.ok(task.jobs[0].logs)
      assert.equal(task.jobs[0].logs.length, 1)
      assert.ok(task.jobs[0].logs[0])
      assert.ok(task.jobs[0].logs[0].loggedDate)
      assert.equal(task.jobs[0].logs[0].message, 'hello world')
      done()
    })
  })

  after(done => {
    infinitas.dropTask(testId, (err) => {
      done(err)
    })
  })

})
