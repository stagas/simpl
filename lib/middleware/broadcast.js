// adds .broadcast to server and server sockets

module.exports = function (context) {
  return function () {
    if (this.server) {
      var server = this

      this.on('connection', function (socket) {
        if (!socket.broadcast) {
          socket.constructor.prototype.broadcast = function (message) {
            var self = this
            server.clients.forEach(function (client) {
              if (client !== self) {
                client.send(message)
              }
            })
          }
        }
      })

      server.constructor.prototype.broadcast = function (message) {
        this.clients.forEach(function (client) {
          client.send(message)
        })
      }
    }
  }
}
