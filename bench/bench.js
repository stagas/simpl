var app = require('express').createServer()

var port = 5888
var host = '127.0.0.1'

var simpl = require('../')
var server = simpl.createServer(app);

server.use(simpl.sid())
server.use(simpl.track())
server.use(simpl.broadcast())

server.on('connection', function (socket) {
  socket.on('message', function (data) {
    if (data === 'broadcast') {
      server.broadcast(data)
    } else {
      socket.send(data)
    }
  })
}).on('disconnect', function (err) {
  console.log('disconnect')
})

app.on('listening', function () {
  console.log('listening')
})

app.listen(port, host)
