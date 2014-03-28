
var assert = require('assert')

var Sonic = require('../Sonic.js')


describe('runtime', function() {

  it('scheduling a job', function(done) {
    var sonic = new Sonic()


    sonic.schedule('* * * * *')

    done()
  })

})
