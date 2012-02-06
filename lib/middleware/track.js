// track connections middleware

module.exports = function () {
  return function () {
    if (this.server) {
      var clients = this.clients = []
      this.on('connection', function (socket) {
        clients.push(socket)
        clients[socket.id] = socket
      })
      this.on('disconnect', function (socket) {
        var index = clients.indexOf(socket)
        if (index > -1) {
          clients.splice(index, 1)
          delete clients[socket.id]
        }
      })
    }
  }
}
