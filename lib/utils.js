// ~ripped from SubStack/dnode-protocol
exports.parseArgs = function parseArgs (argv) {
  var params = {}

  ;[].forEach.call(argv, function (arg) {
    if (typeof arg === 'string') {
      if (arg.match(/^\d+$/)) {
        params.port = +arg
      } 
      else if (arg.match('^/')) {
        params.path = arg
      }
      else {
        params.host = arg
      }
    }
    else if (typeof arg === 'number') {
      params.port = arg
    }
    else if (typeof arg === 'object') {
      if (arg.__proto__ === Object.prototype) {
        // merge vanilla objects into params
        Object.keys(arg).forEach(function (key) {
          params[key] = arg[key]
        })
      }
      else {
        // and non-Stream, non-vanilla objects are probably servers
        params.server = arg
      }
    }
    else if (typeof arg === 'undefined') {
      // ignore
    }
    else {
      throw new Error('Not sure what to do about '
        + typeof arg + ' objects')
    }
  })

  params.httpServer = params.server || params.httpServer
  params.server = params.httpServer || params.server

  return params
}

exports.merge = function merge (target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
  return target
}