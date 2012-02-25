// events middleware

var EventStack = require('eventstack')
var slice = [].slice

module.exports = function () {
  function mergeBind (dest, src, methods) {
    methods.forEach(function (method) {
      dest[method] = src[method].bind(src)
    })
  }
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
        mergeBind(socket.remote, emitter
          , ['on', 'once', 'removeListener', 'removeAllListeners'])
        next()
      })
    } else {
      this.use('connection', function (args, next) {
        var socket = args[1]
        var emitter = socket.emitter = new EventStack
        mergeBind(socket.remote, emitter
          , ['on', 'once', 'removeListener', 'removeAllListeners'])
        next()
      })
    }
  }
}
