var util = require('util')
var EventEmitter = require('events').EventEmitter

var utils = require('./utils')
var WebSocketClient = require('ws')

// Client
var Client = module.exports = function (params) {
  EventEmitter.call(this)

  var self = this
  params.host = params.host || 'localhost'

  self.client = new WebSocketClient('ws://' + params.host + ':' + params.port)
  self.client.on('open', function () {
    self.conn = new Connection(self.client)
    self.conn.on('message', self.emit.bind(self, 'message'))
    self.emit('connect', self.conn)
  })
  self.client.on('error', function (err) {
    self.emit('error', err)
  })
}

util.inherits(Client, EventEmitter)

Client.prototype.send = function (message) {
  this.conn.send(message)
}

Client.prototype.close = function () {
  this.client.terminate()
}

// Connection
var Connection = function (c) {
  EventEmitter.call(this)

  var self = this

  self.conn = c
  self.conn.on('close', self.emit.bind(this, 'close'))
  self.conn.on('message', function (message) {
    self.emit('message', message)
  })
}

util.inherits(Connection, EventEmitter)

Connection.prototype.send = function (message) {
  this.conn.send(message)
}
