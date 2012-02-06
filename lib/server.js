var utils = require('./utils')

module.exports = function () {
  var opts = utils.parseArgs(arguments)
  if (opts.port || opts.server) {
    if (opts.port) {
      opts.server = opts.httpServer = require('express').createServer()
      opts.server.listen(opts.port, opts.host)
    }
    var WebSocketServer = require('./websocket-server')
    return new WebSocketServer(opts)
  }
}
