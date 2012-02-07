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
      this.emitter = new EventStack
      this.remoteEmit = function () {
        this.remote('emit', slice.call(arguments))
      }
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
