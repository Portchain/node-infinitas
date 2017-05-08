

var bodyParser = require('body-parser')
var logger = require('logacious')()
var express = require('express')
var adaro = require('adaro')
var path = require('path')
var http = require('http')
var url = require('url')

let migration = require('./migration.js')
let templates = require('./web/templates.js')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

var app = express()
app.enable('trust proxy', 'loopback')
app.disable('x-powered-by')

app.engine('dust', adaro.dust({
  cache: false,
  whitespace: true,
  helpers: [
    (dust) => { dust.helpers = require('dustjs-helpers').helpers },
    require('portchain-dustjs-helpers')
  ]
}))

app.locals.ENV = {
  PUBNUB_SUBSCRIBE_KEY: process.env.PUBNUB_SUBSCRIBE_KEY,
  PUBNUB_PUBLISH_KEY: process.env.PUBNUB_PUBLISH_KEY
}

app.set('view engine', 'dust')

app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(function(req, res, next) {
  logger.info('ip=', req.ip, 'url=', req.url)
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', templates)

app.use((req, res) => {
  res.status(404).sendFile('404.html', { root: path.join(__dirname, '..', 'public') })
})

let port = process.env.PORT || 3000

var server = http.createServer(app)

function start(callback) {
  migration(err => {
    if(err) {
      logger.error(err)
      if(callback) {
        callback(err, null)
      } else {
        process.exit(1)
      }
    }
    server.listen(port, '::', function (err) {
      if(err) {
        logger.error(err)
      } else {
        logger.info('Server started on port', port)
      }
      
      if(callback) {
        callback(err, server)
      } else if(err) {
        process.exit(1)
      }
    })
  })
}

if(require.main === module) {
  start()
} else {
  module.exports = start
}
