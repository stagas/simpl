var simpl = require('../')

var unixSocket = '/tmp/some-unix-socket.sock'

var server = simpl.createServer(unixSocket)

server.on('message', function (message, conn) {
  console.log("Got message from client:", message)
  server.close()
})

server.on('ready', function () {
  console.log("Server listening")

  var client = simpl.createClient(unixSocket)

  client.on('connect', function () {
    client.send("Hello, world!")
    client.close()
  })
})