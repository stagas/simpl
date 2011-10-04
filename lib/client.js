var utils = require('./utils')

module.exports = function () {
  var params = utils.parseArgs(arguments)
  if (params.port) {
    var WebSocketClient = require('./websocket-client')
    return new WebSocketClient(params)
  }
  else if (params.path) {
    var UnixSocketClient = require('./unix-socket-client')
    return new UnixSocketClient(params)
  }
}