'use strict';

/* Main server code */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client.html');
});

http.listen(3000, function () {
  console.log('listening on port 3000');
});

io.on('connection', function (socket) {
  socket.emit('request-name');
});