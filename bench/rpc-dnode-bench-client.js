var assert = require('assert')
var dnode = require('dnode')

var port = 5888
var host = '127.0.0.1'

var n_clients = +(process.argv[2] || 100)
var n_calls = +(process.argv[3] || 100)
var total = n_clients * n_calls

console.log('clients:', n_clients, 'calls:', n_calls)

function measure () {
  var cnt = total
  var then = Date.now()
  function done () {
    var diff = Date.now() - then
    console.log('' + (total / (diff / 1000)), 'roundtrips per second')
  }
  function pong (pong) {
    if (pong !== 'pong') throw new Error('Not correct answer')
    else {
      --cnt || done()
    }
  }
  for (var r = remotes.length; r--;) {
    var count = n_calls
    for (var n = count; n--;) {    
      remotes[r].ping(pong)
    }
  }
}


var remotes = []
var cnt = n_clients
for (var i = n_clients; i--;) {
  dnode.connect(port, host, function (remote) {
    remotes.push(remote)
    --cnt || measure()
  })
}
