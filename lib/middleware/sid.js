// adds a unique id to the socket

module.exports = function () {
  return function () {
    this.on('connection', function (socket) {
      socket.id = Math.floor(Math.random() * Date.now()).toString(36)
    })
  }
}
