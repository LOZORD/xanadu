/* Main server code */
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let _ = require('lodash');

const MAIN_NS = '/';
const MAIN_ROOM = 'MAIN_ROOM';
const MAX_SOCKETS_PER_ROOM = 8;

app.use(express.static(path.join(__dirname, 'client')));

http.listen(3000, () => {
  console.log('listening on port 3000');
});

// TODO: a more elegant way to get this?
let numSocketsInRoom = 0;

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // check if the socket was even in the main room
    if (socket.wasAcceptedByXanadu) {
      numSocketsInRoom--;
    }
    console.log(`user ${ socket.id } disconnected`);
  });

  if (numSocketsInRoom < MAX_SOCKETS_PER_ROOM) {
    acceptNewSocket(socket);
  } else {
    rejectNewSocket(socket);
  }
});

function acceptNewSocket(socket) {
  socket.join(MAIN_ROOM);
  socket.wasAcceptedByXanadu = true;
  numSocketsInRoom++;
  let spotsLeft = MAX_SOCKETS_PER_ROOM - numSocketsInRoom;
  console.log(`\taccepting socket`);
  console.log(`\t${ spotsLeft } / ${ MAX_SOCKETS_PER_ROOM } spots left`);
  socket.emit('request-name');

  console.log(`socket ${ socket.id } joined room ${ MAIN_ROOM }`);
}

function rejectNewSocket(socket) {
  console.log(`socket ${ socket.id } rejected`);
  socket.emit('rejected-from-room');
}
