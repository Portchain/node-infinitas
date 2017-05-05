
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
      done()
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

  it('unregister a processor', function(done) {

    infinitas.setProcessor(testId, null) // disable
    setTimeout(done, 1500)
  })

  after(done => {
    infinitas.unschedule(testId, (err) => {
      done(err)
    })
  })

})
