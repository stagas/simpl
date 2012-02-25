var simpl = require('../')
var test = require('tap').test

var server, client, socket

test("start server", function (t) {
  t.plan(2)
  server = simpl.createServer(8080)
  server.use(simpl.uid())
  server.use(simpl.events())
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
  client.use(simpl.uid())
  client.use(simpl.events())
  client.use(simpl.json())
  client.on('connect', function () {
    t.pass("client connected")
  })
})

test("client emit to server", function (t) {
  t.plan(1)
  socket.remote.once('hello', function (message) {
    t.equal(message, 'world')
  })
  client.remote.emit('hello', 'world')
})

test("server emit to client", function (t) {
  t.plan(1)
  client.remote.once('hello', function (message) {
    t.equal(message, 'world')
  })
  socket.remote.emit('hello', 'world')
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
