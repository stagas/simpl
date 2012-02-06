# simpl

Highly pluggable WebSockets framework

## Introduction

simpl is a framework over WebSockets, which allows extensions (or middleware)
to be built that extend functionality with a clean and easy api.

## Installation

`npm install simpl`

## Full-featured example

Server:

```javascript
var express = require('express')
var app = express.createServer()
app.use(express.static(__dirname + '/public'))

var simpl = require('simpl');
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
```

Browser:

```html
<script src="/simpl.js"></script>
<script>
  var simpl = require('simpl');
  var client = simpl.createClient();
  client.use(simpl.uid());
  client.use(simpl.rpc());
  client.use(simpl.json());
  client.use(simpl.log());
</script>
<input onkeyup="
  client.remote('multiply', [ this.value, this.value ], function (result) { 
    document.getElementById('result').innerHTML = result;
  });
">
<div id="result"></div>
```


## API


### Server


**server = simpl.createServer(port[, host])**

Creates a webserver with a websocket server attached to it and listens on `port`
and `host`.

**server = simpl.createServer(app)**

Attaches a websocket server to an existing express server.



### Server Methods

**server.use(fn || event [, middleware])**

Use a middleware.

**server.close()**

Closes the server. In case where it's attached to a http server it closes the
http server.



### Server Events


**ready**

Emits when server is listening for connections.

**connection (connection)**

Emits when a client connects to the server. Callbacks a `Connection` object.

**message (message, connection)**

Emits when server receives a message.




### Connection


### Connection Methods


**socket.send(message)**

Sends a message.

**socket.close()**

Closes a connection.



### Connection Events


**message (message)**

Emits when a message is received.

**close**

Emits when the connection closes.




### Client


**client = simpl.createClient(port[, host])**

Creates a client and connects to a websocket server on `port` and `host`.



### Client Methods

**client.use(fn || event [, middleware])**

Use a middleware.

**client.send(message)**

Sends a message to the server.

**client.close()**

Closes the connection.



### Client Events


**connect**

Emits when the client connects to the server.

**message (message)**

Emits when the client receives a message.


## Middleware

**log** -- Logs activity.

**uid** -- Provides a unique id to each outgoing message. Used by `rpc`.

**sid** -- Attach a unique id to the socket.

**track** -- Keep track of connected clients.

**broadcast** -- Adds a `.broadcast` method to the sockets.

**json** -- Send and receive objects (wrapper for `JSON.parse`/`stringify`). Used by almost all other middleware.

**date** -- Adds a date field to each outgoing message, and parses incoming dates to native `Date` objects.

**rpc** -- Remote Procedure Call. Used by `events`.

Example:
  
_Server:_

```javascript
server.use(simpl.rpc({
  someMethod: function (x, y, z, callback) {
    // do stuff
    callback(result);
  }
}));
```

_Client:_

```javascript
client.remote('someMethod', [ 'arg', 'arg', ... ], function (result) {
  // do something with the result
});
```

**events** -- Emit events remotely.

Example:

_Server:_

```javascript
server.use(simpl.events());
server.on('connection', function (socket) {
  socket.emitter.on('some event', function (data) {
    // do something with the data
  });
});
```

_Client:_

```javascript
client.use(simpl.events());
client.remoteEmit('some event', 'some data');
```

## Licence

MIT/X11
