
var postgrator = require('postgrator')
var logger = require('logacious')()
var path = require('path')
var conf = require('./Conf.js')

let migrationsFolder = path.join(__dirname, '..', 'db', 'schema')

module.exports = (config, callback) => {

  let c = {
    migrationDirectory: migrationsFolder,
    schemaTable: 'infinitas_schema_version',
    driver: 'pg',
    host: config.host || conf.db.host,
    port: config.port || conf.db.port,
    database: config.database || conf.db.name,
    username: config.user || conf.db.user,
    password: config.hasOwnProperty('password') ? config.password : conf.db.password,
  }
  console.log(c)
  postgrator.setConfig(c)

  postgrator.migrate('001', function (err, migrations) {
    if(err) {
      logger.error(err)
    } else {
      logger.info(migrations)
    }
    // connection is closed, or will close in the case of SQL Server
    postgrator.endConnection(() => {
      callback(err)
    })
  })
}
