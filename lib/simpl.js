exports.createServer = function (params) {
  var server = require('./server')(params)
  server.use = function (fn) {
    fn(server)
  }
  return server
}

exports.createClient = function (params) {
  var client = require('./client')(params)
  client.use = function (fn) {
    fn(client)
  }
  return client
}
