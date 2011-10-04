var simpl = require('../')
var app = require('express').createServer()

var server = simpl.createServer(app)

server.on('message', function (message, conn) {
  console.log("Got message from client:", message)
  server.close()
})

server.on('ready', function () {
  console.log("Server listening")

  var client = simpl.createClient(8080)

  client.on('connect', function () {
    client.send("Hello, world!")
    client.close()
  })
})

app.listen(8080)