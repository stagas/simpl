var util = require('util')
var EventEmitter = require('events').EventEmitter

var utils = require('./utils')
var net = require('net')

// Client
var Client = module.exports = function (params) {
  EventEmitter.call(this)

  var self = this

  this.client = net.createConnection(params.path)
  this.client.on('connect', function () {
    self.conn = new Connection(self.client)
    self.conn.on('message', self.emit.bind(self, 'message'))
    self.emit('connect', self.conn)
  })
  this.client.on('error', this.emit.bind(this, 'error'))
}

util.inherits(Client, EventEmitter)

Client.prototype.send = function (message) {
  this.conn.send.call(this.conn, message)
}

Client.prototype.close = function () {
  this.conn.close()
}

// Connection
var Connection = function (c) {
  EventEmitter.call(this)

  var self = this

  this.conn = c
  this.conn.setEncoding('utf8')

  this.conn.on('close', this.emit.bind(this, 'close'))

  var buffer = ''
  this.conn.on('data', function (chunk) {
    buffer += chunk
    buffer = buffer.replace(/([^\ufffd]+)\ufffd/gim, function(m, message) {
      self.emit('message', message)
      return ''
    })
  })
}

util.inherits(Connection, EventEmitter)

Connection.prototype.send = function (message) {
  this.conn.write(message + '\ufffd')
}

Connection.prototype.close = function () {
  this.conn.end()
}