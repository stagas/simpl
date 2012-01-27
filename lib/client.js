var utils = require('./utils')

module.exports = function () {
  var params = utils.parseArgs(arguments)
  if (params.port) {
    var WebSocketClient = require('./websocket-client')
    return new WebSocketClient(params)
  }
}