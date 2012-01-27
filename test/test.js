var simpl = require('../')
var test = require('tap').test

var httpServer = require('http').createServer()

var tests = {
  "websocket server standalone": { port: 8080 }
, "websocket server on http server": { server: httpServer }
}

Object.keys(tests).forEach(function (desc) {

  test(desc, function (t) {
    var server
      , client, client2
      , conn, conn2

    var params = tests[desc]

    t.test("create server", function (t) {
      t.plan(1)
      server = simpl.createServer(params)
      server.on('ready', function () {
        t.pass("server is ready")
      })
      if (params.server) {
        params.server.listen(8081)
        params.port = 8081
      }
    })

    t.test("create client", function (t) {
      t.plan(2)
      client = simpl.createClient(params)
      client.on('connect', function () {
        t.pass("client connected")
      })
      server.once('connection', function (c) {
        t.pass("server received connection")
        conn = c
      })
    })

    t.test("server sending 'hello' to client", function (t) {
      t.plan(1)
      client.once('message', function (message) {
        t.equals(message, 'hello', "client received 'hello'")
      })
      conn.send('hello')
    })

    t.test("create client 2", function (t) {
      t.plan(2)
      client2 = simpl.createClient(params)
      client2.on('connect', function () {
        t.pass("client 2 connected")
      })
      server.once('connection', function (c) {
        t.pass("server received connection 2")
        conn2 = c
      })
    })

    t.test("server broadcast 'hello' to clients", function (t) {
      t.plan(2)
      client.once('message', function (message) {
        t.equals(message, 'hello', "client 1 received 'hello'")
      })
      client2.once('message', function (message) {
        t.equals(message, 'hello', "client 2 received 'hello'")
      })
      server.broadcast('hello')
    })

    t.test("client sending 'hello' to server", function (t) {
      t.plan(3)
      server.once('message', function (message, c) {
        t.equals(message, 'hello', "server received 'hello'")
        t.equals(typeof c, 'object', "with a connection object")
      })
      conn.once('message', function (message) {
        t.equals(message, 'hello', "server connection received 'hello'")
      })
      client.send('hello')
    })
 
    t.test("ending test " + desc, function (t) {
      client.close()
      client2.close()
      server.close()
      t.end()
    })

  })

})
