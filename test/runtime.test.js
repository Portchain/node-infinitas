
const assert = require('assert')
const crypto = require('crypto')
const Infinitas = require('../Infinitas.js')
const logger = require('logacious')()

describe('runtime', function() {

  let infinitas

  before((done) => {
    infinitas = new Infinitas({
      onReady: done
    })
  })

  describe('normal task flow', () => {
    let testId = 'test-' + crypto.randomBytes(3).toString('hex')

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
        let jobId = task.jobs[0].id
        
        infinitas.fetchJob(jobId, (err, job) => {
          assert.ok(!err, err ? err.stack : '')
          assert.ok(job)
          assert.ok(job.logs)
          assert.equal(job.logs.length, 1)
          assert.ok(job.logs[0])
          assert.ok(job.logs[0].loggedDate)
          assert.equal(job.logs[0].message, 'hello world')
          done()
        })
      })
    })

    after(done => {
      infinitas.dropTask(testId, (err) => {
        done(err)
      })
    })
  })

  describe('task timeout', () => {

    let testId = 'test-' + crypto.randomBytes(3).toString('hex')

    let task = {
      name: testId,
      schedule: '* * * * * *',
      timeout: 500
    }

    it('schedule task', function(done) {
      infinitas.schedule(task, (err) => {
        done(err)
      })
    })

    it('the job should time out', function(done) {

      infinitas.setProcessor(testId, job => {

        setTimeout(() => {

          infinitas.fetchTask(testId, (err, task) => {
            assert.ok(!err, err ? err.stack : '')
            assert.ok(task)
            assert.ok(task.jobs)
            assert.equal(task.jobs.length, 1)
            assert.ok(task.jobs[0])
            assert.ok(task.jobs[0].failed)
            
            let jobId = task.jobs[0].id
            infinitas.fetchJob(jobId, (err, jobData) => {
              assert.ok(!err, err ? err.stack : '')
              assert.ok(jobData)
              assert.ok(jobData.logs)
              assert.equal(jobData.logs.length, 1)
              assert.ok(jobData.logs[0])
              assert.ok(/timed out/.test(jobData.logs[0].message))

              job.done((err) => {
                assert.ok(err)
                assert.ok(/timed out/.test(err.message))
                done()
              })
              
            })
          })

        }, 600)
        
      })
    })

    after(done => {
      infinitas.dropTask(testId, (err) => {
        done(err)
      })
    })


  })

})
