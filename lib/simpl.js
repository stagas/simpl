var EventStack = require('eventstack')

var slice = [].slice

var constrs = [ 'Server', 'Client' ]

var middlewares = [ 'json', 'date', 'log', 'uid', 'rpc', 'events', 'sid'
                  , 'track', 'broadcast', 'dict' ]

constrs.forEach(function (constr) {
  exports['create' + constr] = function (params) {
    var instance = require('./' + constr.toLowerCase())(params)
    instance._middleware = Object.create(null)
    middlewares.forEach(function (middleware) {
      instance._middleware[middleware] = require('./middleware/' + middleware)
    })
    return instance
  }
})

middlewares.forEach(function (middleware) {
  exports[middleware] = require('./middleware/' + middleware)
})

exports.version = require('../package.json').version
