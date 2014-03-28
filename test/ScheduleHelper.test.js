
var assert = require('assert')

var ScheduleHelper = require('../lib/ScheduleHelper.js')


describe('runtime', function() {

  it('scheduling a job', function(done) {
    var sonic = new Sonic()


    sonic.schedule('* * * * *')

    done()
  })

})
