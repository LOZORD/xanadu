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

// i.e. use lib/client/(index.html)
app.use(express.static(path.join(__dirname, '..', 'client')));

const NODE_MODULES_DIR = path.join(
    __dirname, '..', '..', 'node_modules'
);

// for adding jquery to the client
app.use('/jquery', express.static(path.join(
  NODE_MODULES_DIR, 'jquery', 'dist'
)));

// for adding bootstrap to the client
app.use('/bootstrap', express.static(path.join(
  NODE_MODULES_DIR, 'bootstrap', 'dist'
)));

http.listen(3000, () => {
  console.log('listening on port 3000');
});

// TODO: a more elegant way to get this?
let numSocketsInRoom = 0;

// XXX: this will be held onto by this server's game
let mainRoom = null;

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // check if the socket was even in the main room
    if (socket.wasAcceptedByXanadu) {
      numSocketsInRoom--;
    }
    console.log(`user ${ socket.id } disconnected`);
  });

  //TODO: use mainRoom's number of keys now
  if (numSocketsInRoom < MAX_SOCKETS_PER_ROOM) {
    acceptNewSocket(socket);
  } else {
    rejectNewSocket(socket);
  }

  //console.log(io.sockets.adapter.rooms);
  mainRoom = mainRoom || io.sockets.adapter.rooms[MAIN_ROOM];
});

function acceptNewSocket(socket) {
  socket.join(MAIN_ROOM);
  socket.wasAcceptedByXanadu = true;
  numSocketsInRoom++;
  let spotsLeft = MAX_SOCKETS_PER_ROOM - numSocketsInRoom;
  console.log(`\taccepting socket`);
  console.log(`\t${ spotsLeft } / ${ MAX_SOCKETS_PER_ROOM } spots left`);
  // get the player's name (and any other info)
  // when we get that data back, we will create a Player obj for them
  // and then add them to the game TODO
  socket.emit('request-name');

  console.log(`socket ${ socket.id } joined room ${ MAIN_ROOM }`);
}

function rejectNewSocket(socket) {
  console.log(`socket ${ socket.id } rejected`);
  socket.emit('rejected-from-room');
}
