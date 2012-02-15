module.exports = function (dict) {
  if (!Array.isArray(dict)) throw new Error('Invalid dictionary')
  var reversed = dict.slice().reverse()
  return function () {
    this.before('in', function (args, next) {
      var s = args[1]
      reversed.forEach(function (rule) {
        s = s.split(rule[1]).join(rule[0])
      })
      args[1] = s
      next()
    })
    this.after('out', function (args, next) {
      var s = args[1]
      dict.forEach(function (rule) {
        s = s.split(rule[0]).join(rule[1])
      })
      args[1] = s
      next()
    })
  }
}
