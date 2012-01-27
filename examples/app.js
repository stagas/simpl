var simpl = require('../')
var path = require('path')
var express = require('express')
var app = express.createServer()

app.use(express.logger())
app.use(express.static(path.join(__dirname, 'public')))

var server = simpl.createServer(app)

server.on('message', function (message, conn) {
  conn.broadcast('<' + conn.id + '> ' + message)
})

server.on('connection', function (conn) {
  conn.id = Math.floor(Math.random() * Date.now()).toString(36)
  conn.broadcast('user ' + conn.id + ' has joined')
  conn.on('close', function () {
    conn.broadcast(conn.id + ' left')
  })
})

server.on('ready', function () {
  console.log("Server listening http://localhost:8080/")
})

app.listen(8080)
