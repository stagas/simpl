var simpl = require('../')
var path = require('path')
var express = require('express')
var app = express.createServer()

app.use(express.logger())
app.use(express.static(path.join(__dirname, 'public')))

var server = simpl.createServer(app)
server.use(simpl.sid())
server.use(simpl.track())
server.use(simpl.broadcast())
server.use(simpl.log())

server.on('message', function (message, socket) {
  socket.broadcast('<' + socket.id + '> ' + message)
})

server.on('connection', function (socket) {
  socket.broadcast('* join ' + socket.id)
  socket.on('close', function () {
    socket.broadcast('* leave ' + socket.id)
  })
})

app.listen(8080)
