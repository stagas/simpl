//var app = require('express').createServer()
var dnode = require('dnode')

var port = 5888
var host = '127.0.0.1'

var server = dnode({
  ping: function (callback) {
    callback('pong')
  }
})

server.listen(port, host)

server.on('ready', function () {
  console.log('listening')
})
