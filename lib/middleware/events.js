// events middleware

var EventStack = require('eventstack')
var slice = [].slice

module.exports = function () {
  return function () {
    this.use(this._middleware.rpc({
      emit: function () {
        this.emitter.emit.apply(this.emitter, slice.call(arguments))
      }
    }))
    if (this.client) {
      var emitter = this.emitter = new EventStack
      this.use('connect', function (args, next) {
        var socket = args[1]
        socket.emitter = emitter
        socket.parent.emitter = emitter
        socket.parent.remoteEmit = function () {
          socket.parent.remote('emit', slice.call(arguments))
        }
        next()
      })
    } else {
      this.use('connection', function (args, next) {
        var socket = args[1]
        socket.emitter = new EventStack
        socket.remoteEmit = function () {
          socket.remote('emit', slice.call(arguments))
        }
        next()
      })
    }
  }
}
