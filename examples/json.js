// json example

var simpl = require('../')

var server = simpl.createServer(8080)

server.use(simpl.json())
server.use(simpl.log('server', true)) // the `true` flag will log both ends

server.on('ready', function () {
  var client = simpl.createClient(8080)
  client.use(simpl.json())
  client.use(simpl.log('client', true))
  client.on('connect', function () {
    client.send({ hello: 'world' })
  })
})
