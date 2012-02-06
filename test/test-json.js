var simpl = require('../')
var test = require('tap').test

var server, client, socket

test("start server", function (t) {
  t.plan(2)
  server = simpl.createServer(8080)
  server.use(simpl.json())
  server.on('ready', function () {
    t.pass("server is ready")
  })
  server.on('listening', function () {
    t.pass("server is listening")
  })
})

test("start client", function (t) {
  t.plan(2)
  server.on('connection', function (s) {
    t.pass("received connection")
    socket = s
  })
  client = simpl.createClient(8080)
  client.use(simpl.json())
  client.on('connect', function () {
    t.pass("client connected")
  })
})

test("client send 'hello' to server", function (t) {
  t.plan(3)
  var msg = { hello: 'world' }
  socket.once('message', function (message) {
    t.same(message, msg)
  })
  server.once('message', function (message, s) {
    t.same(message, msg)
    t.same(s, socket)
  })
  client.send(msg)
})

test("server send 'hello back' to client", function (t) {
  t.plan(3)
  var msg = { hello: 'world' }
  client.socket.once('message', function (message) {
    t.same(message, msg)
  })
  client.once('message', function (message, s) {
    t.same(message, msg)
    t.same(s, client.socket)
  })
  socket.send(msg)
})

test("close client", function (t) {
  t.plan(2)
  client.once('disconnect', function () {
    t.pass("client disconnected")
  })
  socket.once('close', function () {
    t.pass("socket closed")
  })
  client.close()
})

test("close server", function (t) {
  t.plan(1)
  server.once('close', function () {
    t.pass("server closed")
  })
  server.close()
})
