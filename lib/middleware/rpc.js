// rpc middleware

var slice = [].slice

module.exports = function (context) {
  var callbacks = Object.create(null)
  function remoteListener (proc, args, socket) {
    if (context.hasOwnProperty(proc)) {
      var procfn = context[proc]
      if ('function' === typeof procfn) {
        try {
          procfn.apply(socket, args)
        } catch (_) {}
      }
    }
  }
  function remote (proc, args, callback) {
    this.send({ proc: proc, args: args, cb: callback })
  }
  return function () {
    this.on('connection', function (c) {
      c.on('remote', remoteListener)
      if (!c.remote) {
        c.constructor.prototype.remote = remote
      }
    })
    this.on('remote', remoteListener)
    this.constructor.prototype.remote = remote

    this.before('in', function (args, next) {
      var o = args[1], socket = args[2]
      if (o.reply && o.to) {
        try {
          callbacks[o.to](o.reply)
        } catch (_) {}
        delete callbacks[o.to]
      } else if ('string' === typeof o.proc
        && Array.isArray(o.args)) {
        o.args.push(function (reply) {
          socket.send({ reply: reply, to: o.id })
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
