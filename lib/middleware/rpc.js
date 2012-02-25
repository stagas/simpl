// rpc middleware

var slice = [].slice

module.exports = function () {
  var namespace = 'rpc' + Math.floor(Math.random() * Date.now()).toString(36)
  var args = slice.call(arguments)
  var arg
  var procs = []
  var context = {}
  var callbacks = {}
  var inSocket = false

  while (arg = args.shift()) {
    if ('string' === typeof arg) procs.push(arg)
    else if (Array.isArray(arg)) procs = procs.concat(arg)
    else if ('boolean' === typeof arg) inSocket = arg
    else context = arg || {}
  }

  function merge (dest, src) {
    for (var k in src) {
      dest[k] = src[k]
    }
    return dest
  }

  function rpcListener (proc, args, socket) {
    if ((context.hasOwnProperty && context.hasOwnProperty(proc))
      || (proc in context)) {
      var procfn = context[proc]
      if ('function' === typeof procfn) {
        try {
          procfn.apply(inSocket ? socket : context, args)
        } catch (_) {}
      }
    }
  }

  function makeRemoteProcedures (parent) {
    var remoteContext = {}
    procs.forEach(function (proc) {
      remoteContext[proc] = function remoteCall () {
        var args = slice.call(arguments)
        var callback = function () {}
        if ('function' === typeof args[args.length - 1]) {
          callback = args.pop()
        }
        parent.send({ proc: proc, args: args, cb: callback })
      }
    })
    return remoteContext
  }

  function socketMiddleware (args, next) {
    var socket = args[1]
    socket.on(namespace, rpcListener)
    socket.remote = merge(socket.remote || {}, makeRemoteProcedures(socket))
    if (socket.parent) socket.parent.remote = socket.remote
    next()
  }

  return function () {
    if (this.client) {
      this.use('connect', socketMiddleware)
    } else {
      this.use('connection', socketMiddleware)
    }

    this.before('in', function (args, next) {
      var o = args[1], socket = args[2]
      if (o.reply && o.to) {
        try {
          callbacks[o.to].apply(this, o.reply)
        } catch (_) {}
        delete callbacks[o.to]
      } else if ('string' === typeof o.proc
        && Array.isArray(o.args)) {
        o.args.push(function () {
          socket.send({ reply: slice.call(arguments), to: o.id })
        })
        socket.emit(namespace, o.proc, o.args, socket)
      } else {
        next()
      }
    })

    this.after('out', function (args, next) {
      var o = args[1]
      if ('string' === typeof o.proc
        && Array.isArray(o.args)
        && 'function' === typeof o.cb) {
        callbacks[o.id] = o.cb
        delete o.cb
      }
      next()
    })
  }
}
