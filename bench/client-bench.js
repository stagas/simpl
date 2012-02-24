var simpl = require('../')
var clients = {}

var cnt = +(process.argv[2] || 10)
var total = cnt
var massTotal = 0
var massMul = +(process.argv[3] || 10)
var port = 5888
var time
var what = 'connections'

var massOk = false

function mass () {
  massOk = true
  what = 'roundtrips'
  massTotal = cnt = Math.pow(total, 2) * massMul
  console.log(massTotal)
  time = Date.now()
  for (var i = total; i--;) {
    clients[i].on('message', function () {
      --cnt || done()
    })
    for (var x = massMul; x--;) {
      clients[i].send('broadcast')
    }
  }
}

function done () {
  var diff = Date.now() - time
  console.log(diff)
  console.log('' + ((massTotal || total) / (diff / 1000)), what, 'per second')
  if (!massOk) mass()
}

time = Date.now()
for (var i = cnt; i--;) {
  ;(function (client) {
    client.once('connect', function (socket) {
      client.once('message', function (message) {
        --cnt || done()
      })
      client.send('hello')
    });
  }(clients[i] = simpl.createClient(port)));
}
