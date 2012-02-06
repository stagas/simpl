var utils = require('./utils')

module.exports = function () {
  var opts = utils.parseArgs(arguments)
  if (opts.port) {
    var WebSocketClient = require('./websocket-client')
    return new WebSocketClient(opts)
  }
}
