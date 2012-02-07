var util = require('util')
var EventStack = require('eventstack')
var WebSocketClient = require('ws')

// Client
var Client = exports = module.exports = function (opts) {
  EventStack.call(this)

  var self = this

  this.settings = {
    host: opts.host || '127.0.0.1'
  , port: opts.port || 8080
  }

  this.on('in', function (message, socket) {
    socket.emit('message', message)
    this.emit('message', message, socket)
  })
  this.on('out', function (message, socket) {
    socket.socket.send(message)
  })

  var wsurl = 'ws://' + this.settings.host + ':' + this.settings.port
  this.client = new WebSocketClient(wsurl)
  this.client.url = wsurl
  this.client.on('error', this.emit.bind(this))
  this.client.on('open', function () {
    self.socket = new Connection(self, self.client)
    self.socket.on('in', function (message) {
      self.emit('in', message, self.socket)
    })
    self.socket.on('out', function (message) {
      self.emit('out', message, self.socket)
    })
    self.socket.on('close', self.emit.bind(self, 'disconnect', self.socket))
    self.emit('connect', self.socket)
  })
}

util.inherits(Client, EventStack)

Client.prototype.send = function (message) {
  this.socket.send(message)
}

Client.prototype.close = function () {
  this.socket.close()
}

// Connection
var Connection = exports.Connection = function (parent, socket) {
  EventStack.call(this)

  var self = this

  this.url = socket.url
  this.parent = parent
  this.socket = socket
  this.socket.on('close', this.emit.bind(this))
  this.socket._socket.on('end', this.emit.bind(this, 'close'))
  this.socket.on('message', this.emit.bind(this, 'in'))
}

util.inherits(Connection, EventStack)

Connection.prototype.close = function () {
  this.socket._socket.end()
}

Connection.prototype.send = function (message) {
  this.emit('out', message)
}
