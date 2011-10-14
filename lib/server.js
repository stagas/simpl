var utils = require('./utils')

module.exports = function () {
  var params = utils.parseArgs(arguments)
  if (params.port || params.server) {
    if (params.port) {
      params.server = params.httpServer = require('http').createServer()
      params.server.listen(params.port, params.host)
    }
    var WebSocketServer = require('./websocket-server')
    return new WebSocketServer(params)
  }
  else if (params.path) {
    var UnixSocketServer = require('./unix-socket-server')
    return new UnixSocketServer(params)
  }
}
