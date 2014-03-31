
var fs = require('fs')
var path = require('path')
var uuid = require('uuid')
var lockFile = require('lockfile')


var DEFAULT_STORAGE_DIRECTORY = process.pwd + '/.infinitas_db'

function FileSystemStore(options) {
  this._directory = options.directory || DEFAULT_STORAGE_DIRECTORY
  this._jobMappingFilePath = this._directory + '/jobs.txt'


  if(!fs.existsSync(this._directory)) {
    fs.mkdirSync(this._directory)
  }

  if(!fs.existsSync(this._jobMappingFilePath)) {
    fs.writeFileSync(this._jobMappingFilePath, '{}')
  }

}

FileSystemStore.prototype.scheduleJob = function(jobName, schedule, callback) {
  var self = this
  this._registerNewJobName(jobName, function(err) {
    if(err) {
      console.error(err)
      if(callback) callback(err)
      return
    } else {


    }
  })
}


FileSystemStore.prototype._registerNewSchedule = function(jobName, schedule, callback) {
  var self = this
  lock(this._jobMappingFilePath, function(err) {
    if(err) {
      return callback(err)
    } else {

      self._registerNewScheduleUnsafe(jobName, schedule, function(saveDataErr) {

        unlock(self._jobMappingFilePath, function(err) {
          if(err) {
            console.error(err)
          }
          callback(saveDataErr || err)
        })
      })


    }
  })
}

FileSystemStore.prototype._registerNewScheduleUnsafe = function(jobName, callback) {
  var self = this
  fs.readFile(this._jobMappingFilePath, function(err, content) {
    var jobs = {}
    try {
      jobs = JSON.parse(content)
    } catch(parseError) {
      console.error('file content of', self._jobMappingFilePath, 'is corrupted (not JSON)', content)
    }
    if(!jobs[jobName]) {
      jobs[jobName] = uuid.v4()
    }

    fs.writeFile(self._jobMappingFilePath, JSON.stringify(jobs, null, 2), function(err) {
      callback(err)
    })
  })
}

FileSystemStore.prototype._registerNewJobName = function(jobName, callback) {
  var self = this
  lock(this._jobMappingFilePath, function(err) {
    if(err) {
      return callback(err)
    } else {

      self._registerNewJobNameUnsafe(jobName, function(saveDataErr) {

        unlock(self._jobMappingFilePath, function(err) {
          if(err) {
            console.error(err)
          }
          callback(saveDataErr || err)
        })
      })


    }
  })
}

FileSystemStore.prototype._registerNewJobNameUnsafe = function(jobName, callback) {
  var self = this
  fs.readFile(this._jobMappingFilePath, function(err, content) {
    var jobs = {}
    try {
      jobs = JSON.parse(content)
    } catch(parseError) {
      console.error('file content of', self._jobMappingFilePath, 'is corrupted (not JSON)', content)
    }
    if(!jobs[jobName]) {
      jobs[jobName] = uuid.v4()
    }

    fs.writeFile(self._jobMappingFilePath, JSON.stringify(jobs, null, 2), function(err) {
      callback(err)
    })
  })
}


function lock(file, callback) {
  lockFile.lock(file + '.lock', {wait: 1000, stale: 30000, retries: 10, retryWait: 2000}, function (err) {
    callback(err)
  })
}

function unlock(file, callback) {
  lockFile.unlock(file + '.lock', function(err) {
    callback(err)
  })
}



module.exports = FileSystemStore
