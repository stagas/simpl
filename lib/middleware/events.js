// events middleware

var EventStack = require('eventstack')
var slice = [].slice

module.exports = function () {
  return function () {
    var self = this
    this.use(this._middleware.rpc({
      emit: function () {
        this.emitter.emit.apply(this.emitter, slice.call(arguments))
      }
    }, 'emit', true))
    if (this.client) {
      var emitter = this.emitter = new EventStack
      this.use('connect', function (args, next) {
        var socket = args[1]
        socket.emitter = emitter
        socket.parent.emitter = emitter
        socket.remote = socket.parent.remote
        socket.remote(function (remote) {
          socket.remote.emit = socket.remoteEmit = remote.emit
        })
        next()
      })
    } else {
      this.use('connection', function (args, next) {
        var socket = args[1]
        socket.emitter = new EventStack
        socket.remote(function (remote) {
          socket.remote.emit = socket.remoteEmit = remote.emit
        })
        next()
      })
    }
  }
}
