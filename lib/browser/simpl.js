var util = require('util')
var EventStack = require('eventstack')
var WS = window.MozWebSocket ? window.MozWebSocket : window.WebSocket

var Client = function (port, host) {
  EventStack.call(this)

  var self = this

  this.parent = this

  this.settings = {
    port: port || ''
  , host: host || window.location.href.split('/')[2]
  }

  this.on('in', function (message, socket) {
    self.emit('message', message, socket)
  })
  this.on('out', function (message) {
    self.client.send(message)
  })
}

util.inherits(Client, EventStack)

Client.prototype.connect = function () {
  var self = this
  var wsurl = 'ws://' + this.settings.host + (this.settings.port ? ':' + this.settings.port : '')
  this.url = wsurl
  this.client = new WS(wsurl)

  this.client.onmessage = function (message) {
    self.emit('in', message.data, self)
  }
  this.client.onopen = function () {
    self.emit('connect', self)
    self.emit('open', self)
    self.emit('ready', self)
  }
  this.client.onerror = function (err) {
    self.emit('error', err)
  }
  this.client.onclose = function () {
    self.emit('close', self)
  }
}

Client.prototype.send = function (message) {
  this.emit('out', message)
}

Client.prototype.destroy = function () {
  this.client.onmessage = null
  this.client.onopen = null
  this.client.onerror = null
  delete this.client
  this.removeAllListeners()
}

var simpl = Object.create(null)
var middlewares = [ 'date', 'events', 'json', 'log', 'rpc', 'uid', 'dict' ]

simpl.createClient = function (port, host) {
  var client = new Client(port, host)
  client.connect()
  client._middleware = Object.create(null)
  middlewares.forEach(function (m) {
    client._middleware[m] = require('middleware/' + m)
  })
  return client
}

middlewares.forEach(function (m) {
  simpl[m] = require('middleware/' + m)
})

module.exports = simpl
