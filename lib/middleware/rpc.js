// rpc middleware

var slice = [].slice

module.exports = function (context) {
  var args = slice.call(arguments)
  var arg
  var procs = []
  var context
  var inSocket = false
  while (arg = args.shift()) {
    if ('string' === typeof arg) procs.push(arg)
    else if (Array.isArray(arg)) procs = procs.concat(arg)
    else if ('boolean' === typeof arg) inSocket = arg
    else context = arg || {}
  }

  var callbacks = {}

  function remoteListener (proc, args, socket) {
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

  function remote (callback) {
    var self = this
    var o = {}
    procs.forEach(function (proc) {
      o[proc] = function () {
        var args = slice.call(arguments)
        var callback = function () {}
        if ('function' === typeof args[args.length - 1]) {
          callback = args.pop()
        }
        self.send({ proc: proc, args: args, cb: callback })
      }      
    })
    callback.call (o,o) // woo
  }

  return function () {
    this.use('connection', function (args, next) {
      var c = args[1]
      c.on('remote', remoteListener)
      c.remote = remote
      next()
    })
    this.on('remote', remoteListener)
    this.remote = remote

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
        this.emit('remote', o.proc, o.args, socket)
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
