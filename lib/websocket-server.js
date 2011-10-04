var util = require('util')
var EventEmitter = require('events').EventEmitter

var utils = require('./utils')
var WebSocketServer = require('websocket').server

// Server
var Server = module.exports = function (params) {
  EventEmitter.call(this)

  var self = this

  this.connections = []

  params = utils.merge({
    autoAcceptConnections: true
  }, params)

  this.httpServer = params.httpServer
  this.httpServer.on('listening', function () {
    self.emit('ready')
  })

  this.server = new WebSocketServer(params)
  this.server.on('connect', function (c) {
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
  this.httpServer.close()
}

// Connection
var Connection = function (server, conn) {
  EventEmitter.call(this)

  var self = this

  this.server = server
  this.conn = conn
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