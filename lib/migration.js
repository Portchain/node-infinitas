
var postgrator = require('postgrator')
var logger = require('logacious')()
var path = require('path')
var conf = require('./Conf.js')

let migrationsFolder = path.join(__dirname, '..', 'db', 'schema')

module.exports = (callback) => {

  postgrator.setConfig({
    migrationDirectory: migrationsFolder,
    schemaTable: 'infinitas_schema_version',
    driver: 'pg',
    host: conf.db.host,
    port: conf.db.port,
    database: conf.db.name,
    username: conf.db.user,
    password: conf.db.password
  })

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
