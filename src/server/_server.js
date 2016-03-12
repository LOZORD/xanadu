/* DEPRECATED -- SERVER CODE IN GAME CLASS */
/* Main server code */
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let _ = require('lodash');
let Game = require('../common/game');
let Player = require('../common/player');

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

// XXX: this will be held onto by this server's game
// having it be null is spooky, can we assign it something else?
// possibly merge old value and new value
let mainRoom = null;

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log(`user ${ socket.id } disconnected`);

    _.remove(game.players, player => player.id() === socket.player.id());

    if (mainRoom && mainRoom.length === 0) {
      mainRoom = null;
    }
  });

  // if the room is empty or there is still room
  if (!mainRoom || mainRoom.length < MAX_SOCKETS_PER_ROOM) {
    acceptNewSocket(socket);
  } else {
    rejectNewSocket(socket);
  }

  mainRoom = mainRoom || io.sockets.adapter.rooms[MAIN_ROOM];
  //console.log(mainRoom);

});

let game = new Game();

game.on('new-player', (data) => {
  io.emit('message', data);
});

function acceptNewSocket(socket) {
  socket.join(MAIN_ROOM);
  socket.player = new Player({
    socket: socket,
    game: game
  });
  socket.wasAcceptedByXanadu = true;
  let socketsInRoom = mainRoom ? mainRoom.length : 1;
  let spotsLeft = MAX_SOCKETS_PER_ROOM - socketsInRoom;
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
