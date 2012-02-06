// json middleware

module.exports = function () {
  return function () {
    this.before('in', function (args, next) {
      try { args[1] = JSON.parse(args[1]) }
      catch (_) {}
      next()
    })
    this.after('out', function (args, next) {
      try { args[1] = JSON.stringify(args[1]) }
      catch (_) {}
      next()
    })
  }
}
