var util = require('util')
var EventEmitter = require('events').EventEmitter

var utils = require('./utils')
var net = require('net')

// Server
var Server = module.exports = function (params) {
  EventEmitter.call(this)

  var self = this

  this.connections = []

  this.server = net.createServer()
  this.server.listen(params.path)
  this.server.on('listening', this.emit.bind(this, 'ready'))
  this.server.on('connection', function (c) {
    var conn = new Connection(self, c)
    self.emit('connection', conn)
    self.connections.push(conn)
    conn.on('close', function () {
      var connIndex = self.connections.indexOf(conn)
      if (~connIndex) {
        self.connections.splice(connIndex, 1)
      }
    })
    conn.on('message', function (message) {
      self.emit('message', message, conn)
    })
  })
}

util.inherits(Server, EventEmitter)

Server.prototype.broadcast = function (message) {
  this.connections.forEach(function (conn) {
    conn.send(message)
  })
}

Server.prototype.close = function () {
  this.server.close()
}

// Connection
var Connection = function (server, conn) {
  EventEmitter.call(this)

  var self = this

  this.server = server
  this.conn = conn
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
  this.conn.writable && this.conn.write(message + '\ufffd')
}

Connection.prototype.broadcast = function (message) {
  var self = this
  this.server.connections.forEach(function (conn) {
    if (self !== conn) {
      conn.send(message)
    }
  })
}

Connection.prototype.close = function () {
  this.conn.close()
}