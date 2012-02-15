var util = require('util')
var EventStack = require('eventstack')
var expose = require('express-expose')
var WebSocketServer = require('ws').Server

// Server
var Server = exports = module.exports = function (opts) {
  EventStack.call(this)

  var self = this

  var app = this.app = opts.httpServer || opts.app
  app.on('listening', function () {
    self.settings.port = app.address().port
    self.emit('ready', self)
    self.emit('listening', self)
  })

  self.settings = opts

  app.exposeRequire()
  app.expose({ inherits: util.inherits }, 'util')
  app.exposeModule(require.resolve('./events'), 'events')
  app.exposeModule(require.resolve('eventstack/lib/eventstack'), 'eventstack')
  app.exposeModule(require.resolve('./browser/simpl'), 'simpl')

  if (app.get) {
    ;[ 'date', 'events', 'json', 'log', 'rpc', 'uid', 'dict' ]
    .forEach(function (m) {
      app.exposeModule(require.resolve('./middleware/' + m), 'middleware/' + m)
    })

    app.get('/simpl.js', function (req, res) {
      res.setHeader('content-type', 'application/javascript')
      res.send(app.exposed())
    })
  }
  else {
    app.on('request', function (req, res) {
      if (req.url === '/simpl.js') {
        res.writeHead(200, { 'content-type': 'application/javascript' })
        res.end(app.exposed())
      }
    })
  }

  app.on('close', this.emit.bind(this))

  this.on('in', function (message, socket) {
    socket.emit('message', message)
    this.emit('message', message, socket)
  })
  this.on('out', function (message, socket) {
    try {
      socket.socket.send(message)
    } catch (_) {}
  })

  this.server = new WebSocketServer({ server: this.app })
  this.server.on('error', this.emit.bind(this))
  this.server.on('connection', function (socket) {
    socket = new Connection(self, socket)
    socket.on('in', function (message) {
      self.emit('in', message, socket)
    })
    socket.on('out', function (message) {
      self.emit('out', message, socket)
    })
    socket.on('close', function () {
      self.emit('disconnect', socket)
    })
    self.emit('connection', socket)
  })
}

util.inherits(Server, EventStack)

Server.prototype.close = function () {
  this.server.close()
  this.app.close()
  this.emit('close', this)
}

// Connection
var Connection = exports.Connection = function (server, socket) {
  EventStack.call(this)

  this.server = server
  this.socket = socket

  this.remoteAddress = socket.upgradeReq.socket.remoteAddress

  this.socket.on('close', this.emit.bind(this))
  this.socket._socket.on('end', this.emit.bind(this, 'close'))
  this.socket.on('message', this.emit.bind(this, 'in'))
  this.socket.on('error', this.emit.bind(this))
}

util.inherits(Connection, EventStack)

Connection.prototype.send = function (message) {
  this.emit('out', message)
}

Connection.prototype.close = function () {
  this.socket.close()
}

Connection.prototype.disconnect = Connection.prototype.close
