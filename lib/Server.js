

var bodyParser = require('body-parser')
var logger = require('logacious')()
var express = require('express')
var adaro = require('adaro')
var csurf = require('csurf')
var path = require('path')
var http = require('http')
var url = require('url')

var WSServer = require('./lib/ws/WSServer.js')
let migrations = require('./lib/migrations.js')
let publicTemplates = require('./lib/web/templates.js')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

var app = express()
app.enable('trust proxy', 'loopback')
app.disable('x-powered-by')

app.engine('dust', adaro.dust({
  cache: false,
  whitespace: true,
  helpers: [
    (dust) => { dust.helpers = require('dustjs-helpers').helpers }
  ]
}))

app.locals.ENV = {
  PUBNUB_SUBSCRIBE_KEY: process.env.PUBNUB_SUBSCRIBE_KEY,
  PUBNUB_PUBLISH_KEY: process.env.PUBNUB_PUBLISH_KEY
}

app.set('view engine', 'dust')

app.use(compression())
app.use(express.static(path.join(__dirname, 'public')))
app.use(function(req, res, next) {
  logger.info('ip=', req.ip, 'url=', req.url)
  next()
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(csurf({cookie: true}))
auth.setupSessions(app)
app.use(utils.errorResponse)
//app.use(publicAPIs)
app.use(publicTemplates)



app.use('/app/', appRouter)
app.use('/su/', adminRouter)

app.use((req, res) => {
  res.status(404).sendFile('index.html', { root: path.join(__dirname, 'public') })
})

let port = process.env.PORT || 3000

var server = http.createServer(app)

new WSServer(server)


function start(callback) {
  migrations(err => {
    if(err) {
      logger.error(err)
      if(callback) {
        callback(err)
      } else {
        process.exit(1)
      }
    }
    server.listen(port, '::', function () {
      logger.info('Server started on port', port)
      
      if(callback) {
        callback(server)
      }
    })
  })
}

if(require.main === module) {
  start()
} else {
  module.exports = start
}
