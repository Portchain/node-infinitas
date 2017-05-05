'use strict'

var path = require('path')
var pgJs = require('pg-js')
var conf = require('./Conf.js')


module.exports = () => {
  return pgJs({
    host: conf.db.host,
    port: conf.db.port,
    database: conf.db.name,
    user: conf.db.user,
    password: conf.db.password,
    queryDirectory: path.join(__dirname, '..', 'db', 'queries')
  })
}
