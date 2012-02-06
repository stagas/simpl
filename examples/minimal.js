// minimal example

var simpl = require('../')

var server = simpl.createServer(8080)

server.use(simpl.log('server'))

server.on('ready', function () {
  var client = simpl.createClient(8080)
  client.use(simpl.log('client'))
  client.on('connect', function () {
    client.send('hello, world')
  })
})
