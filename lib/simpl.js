var EventStack = require('eventstack')

var slice = [].slice

var constrs = [ 'Server', 'Client' ]
var middlewares = [ 'json', 'date', 'log', 'uid', 'rpc', 'events', 'sid', 'track', 'broadcast' ]

constrs.forEach(function (constr) {
  exports['create' + constr] = function (params) {
    var instance = require('./' + constr.toLowerCase())(params)
    return instance
  }
})

middlewares.forEach(function (middleware) {
  exports[middleware] = require('./middleware/' + middleware)
})
