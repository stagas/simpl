var util = require('util')
var EventEmitter = require('events').EventEmitter

var utils = require('./utils')
var WebSocketClient = require('websocket').client

// Client
var Client = module.exports = function (params) {
  EventEmitter.call(this)

  var self = this
  params.host = params.host || 'localhost'

  this.client = new WebSocketClient(params)
  this.client.connect('ws://' + params.host + ':' + params.port)
  this.client.on('connect', function (c) {
    self.conn = new Connection(c)
    self.conn.on('message', self.emit.bind(self, 'message'))
    self.emit('connect', self.conn)
  })
  this.client.on('connectFailed', function () {
    self.emit('error', new Error('Cannot connect to '
      + params.host + ':' + params.port))
  })
}

util.inherits(Client, EventEmitter)

Client.prototype.send = function (message) {
  this.conn.send(message)
}

Client.prototype.close = function () {
  this.client.socket.end()
}

// Connection
var Connection = function (c) {
  EventEmitter.call(this)

  var self = this

  this.conn = c
  this.conn.on('close', this.emit.bind(this, 'close'))
  this.conn.on('message', function (message) {
    if ('utf8' === message.type) {
      self.emit('message', message.utf8Data)
    }
  })
}

util.inherits(Connection, EventEmitter)

Connection.prototype.send = function (message) {
  this.conn.sendUTF(message)
}