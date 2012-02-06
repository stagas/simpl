module.exports = function () {
  return function () {
    this.after('out', function (args, next) {
      args[1].id = Math.floor(Math.random() * Date.now()).toString(36)
      next()
    })
  }
}
