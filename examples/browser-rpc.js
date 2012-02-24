var express = require('express')
var app = express.createServer()
app.use(express.static(__dirname + '/public'))

var simpl = require('../');
var server = simpl.createServer(app);

server.use(simpl.uid());
server.use(simpl.rpc({
  'multiply': function (a, b, callback) {
    callback(a * b);
  }
}));
server.use(simpl.json());
server.use(simpl.log());

app.listen(8080);
app.on('listening', function () {
  console.log('Go to: http://localhost:8080/rpc.html')
})
