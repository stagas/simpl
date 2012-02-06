// date middleware

module.exports = function (key) {
  key = key || 'date'
  return function () {
    this.before('in', function (args, next) {
      args[1][key] = new Date(args[1][key])
      next()
    })
    this.after('out', function (args, next) {
      args[1][key] = new Date()
      next()
    })
  }
}
