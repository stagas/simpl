# simpl

Simple sockets anywhere


## Introduction

simpl is a unified API for websockets and unix sockets. I wanted to send simple
text messages around and have the same API, whether it's a web server or a shell
app. This does just that.


## Installation

`npm install simpl`


## Example

Server:

```javascript
var simpl = require('simpl');

var server = simpl.createServer(8080);

server.on('message', function (message, conn) {
  console.log("Got message from client:", message);
  server.close();
});

server.on('ready', function () {
  server.on('connection', function (conn) {
    conn.on('message', function (message) {
      console.log(message);
    });
  });
});
```

Browser:

```javascript
<script src="/simpl.js">
<script>
  var client = simpl();
  client.on('connect', function () {
    consle.log('client connected')
    client.send('Hello, world!')
  });
  client.on('message', function (message) {
    console.log(message);
  });
</script>
```


## API


### Server


**server = simpl.createServer(port[, host])**

Creates a webserver with a websocket server attached to it and listens on `port`
and `host`.

**server = simpl.createServer(httpServer)**

Attaches a websocket server to an existing http server.



### Server Methods


**server.broadcast(message)**

Broadcasts a message to all connected clients.

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


**conn.send(message)**

Sends a message.

**conn.broadcast(message)**

Broadcasts a message to all clients except this one.

**conn.close()**

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


**client.send(message)**

Sends a message to the server.

**client.close()**

Closes the connection.



### Client Events


**connect**

Emits when the client connects to the server.

**message (message)**

Emits when the client receives a message.

