'use strict'

var path = require('path')
var pgJs = require('pg-js')
var conf = require('./Conf.js')


module.exports = (config) => {
  config = config || {}
  return pgJs({
    host: config.host || conf.db.host,
    port: config.port || conf.db.port,
    database: config.database || conf.db.name,
    user: config.user || conf.db.user,
    password: config.hasOwnProperty('password') ? config.password : conf.db.password,
    queryDirectory: path.join(__dirname, '..', 'db', 'queries')
  })
}
