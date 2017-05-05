/* eslint-disable */ // accept the shady magic of this file
/* $lab:coverage:off$ */
// don't use strict mode on that file because it breaks the module stack hack

const _ = require('lodash')
const path = require('path')
const moment = require('moment')

Object.defineProperty(module, '__stack', {
  get: function () {
    var orig = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }
    var err = new Error()
    Error.captureStackTrace(err, arguments.callee)
    var stack = err.stack
    delete Error.prepareStackTrace
    Error.prepareStackTrace = orig
    return stack
  }
})

const STACK_DEPTH = parseInt(process.env.LOGACIOUS_STACK_DEPTH, 10) || 3

Object.defineProperty(module, '__caller_info', {
  get: function () {
    var callerStack = module.__stack
    return {
      line: callerStack[STACK_DEPTH].getLineNumber(),
      file: path.relative(process.cwd(), callerStack[STACK_DEPTH].getFileName()),
      functionName: callerStack[STACK_DEPTH].getFunctionName()
    }
  }
})

function prefix () {
  var callerInfo = module.__caller_info
  return callerInfo.file + ':' + callerInfo.line
}

function prepare (jsArguments) {
  var args =_.map(jsArguments, function (item, i) {
    if(item instanceof String) {
      return item
    } else if(item instanceof Error) {
      let str = `${item.message}\n`
      if(item.code) {
        str += `code=${item.code}\n`
      }
      if(item.statusCode) {
        str += `statusCode=${item.statusCode}\n`
      }
      str += item.stack
      return str
    }else {
      console.log('>>>>>', item, i)
      try {
        return JSON.stringify(item)
      }
      catch(e) {
        // can happen if item has circular dependencies.
        // In which case, logging [item] will default
        //   below to whatever console.log can handle.
        return item
      }
    }
  })
  return args
}

function wrapWithMetadata (level, func) {
  return function () {
    var args = prepare(arguments)
    return func.apply(null, args)
  }
}

const info = wrapWithMetadata('INFO', console.log)


function Infinitas(options) {
  setTimeout(() => {
    options.done()
  })
}


Infinitas.prototype.addProcessor = function(taskName, func) {
  info(arguments)
}

module.exports = Infinitas



setTimeout(() => {
  let infinitas = new Infinitas({
    done: () => {

      setTimeout(() => {
        
        infinitas.addProcessor('fubar', job => {
          info('hello world')
        }, 2)
      })
    }
  })
})
