var app = require('express').createServer()

var port = 5888
var host = '127.0.0.1'

var simpl = require('../')
var server = simpl.createServer(app);

server.use(simpl.uid())
server.use(simpl.rpc({
  ping: function (callback) {
    callback('pong')
  }
}))
server.use(simpl.json())

app.on('listening', function () {
  console.log('listening')
})

app.listen(port, host)
