// log middleware

var slice = [].slice

module.exports = function (name, both) {
  name = name && name + ':' || '*'
  function log () {
    var args = slice.call(arguments)
    args.unshift(name)
    console.log.apply(console, args)
  }
  function listening (args, next) {
    log('listening on port', args[1].settings.port)
    next()
  }
  function login (args, next) {
    log(' in <==', args[1])
    next()
  } 
  function logout (args, next) {
    log('out ==>', args[1])
    next()
  }
  function connection (args, next) {
    log('connection <==', args[1].remoteAddress)
    next()    
  }
  function disconnect (args, next) {
    log('disconnected !!!', (args[1] && args[1].remoteAddress) || args[1].url)
    next()
  }
  function connect (args, next) {
    log('connected ==>', args[1].url)
    next()    
  }
  function close (args, next) {
    log('connection closed ###')
    next()
  }
  return function () {
    this.use('listening', listening)
    this.use('connection', connection)
    this.use('disconnect', disconnect)
    this.use('connect', connect)
    this.use('close', close)
    this.before('in', login)
    this.after('out', logout)
    if (both) {
      this.after('in', login)
      this.before('out', logout)
    }
  }
}
