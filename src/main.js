/* eslint no-console: 0 */
import process from 'process';
import Game from './server/game';
import Server from './server/server';
//import _ from 'lodash';

let die = (msg) => {
  console.error(msg);
  process.exit(1);
};

let parseArgs = (argv) => {
  let args = {};
  let i = 2; // skip node and filename
  while (i < argv.length) {
    if (argv[i] == '--port') {
      let port = parseInt(argv[i+1]);
      if (isNaN(port) || port < 1 || port > 65535) {
        die(`Invalid port "${ argv[i+1] }"`);
      } else {
        args.port = port;
      }
      i += 2;
    } else if (argv[i] == '--ns') {
      // Not supported
      die('Unsupported argument --ns');
    } else if (argv[i] == '--maxPlayers') {
      let maxPlayers = parseInt(argv[i+1]);
      if (isNaN(maxPlayers) || maxPlayers < 2) {
        die(`Invalid maxPlayers "${ argv[i+1] }"`);
      } else {
        args.maxPlayers = maxPlayers;
      }
    } else if (argv[i] == '--players') {
      // Not supported
      die('Unsupported argument --player');
    } else if (argv[i] == '--seed') {
      let seed = parseInt(argv[i+1]);
      if (isNaN(seed)) {
        die(`Invalid seed "${ argv[i+1] }"`);
      } else {
        args.seed = seed;
      }
      i += 2;
    } else {
      die(`Unexpected arg "${ argv[i] }"`);
    }
  }
  return args;
};

let args = parseArgs(process.argv);

let server  = new Server(args);
let game    = new Game(args);

server.gameNS.on('connection', (socket) => {
  // when people connect...
  if (game.isAcceptingPlayers()) {
    server.acceptSocket(socket, game);
    game.addPlayer(socket);
  } else {
    server.rejectSocket(socket);
  }

  // when people send _anything_ from the client
  socket.on('message', (messageObj) => {
    let responseObj = game.handleMessage(messageObj);

    if (responseObj) {
      server.sendMessage(responseObj);
    }
  });

  // when people disconnect
  socket.on('disconnect', () => {
    if (game.hasPlayer(socket.id)) {
      let player = game.getPlayer(socket.id);
      console.log(`user ${ socket.id + '--' + player.name } disconnected`);
      // FIXME: socket/player communication needs to be redone
      socket.broadcast(`${ player.name } has left the game.`);
      game.removePlayer(socket.id);
    } else {
      console.log(`anon user ${ socket.id } disconnected`);
    }
  });

});

if (server.debug) {
  server.debugNS.on('connection', (socket) => {
    socket.on('get', () => {
      socket.emit('update', game
        .players()
        .map(player => player.debugString())
        .join('\n'));
    });
  });
}

/*
const UPDATE_WAIT_TIME = 10 * 1000; // ten seconds

This is what we eventually want, but starting immediately is incorrect!

let update = () => {
  let updateObj = game.performMoves();

  _.forEach(updateObj, (updateObj) => {
    server.sendMessage(updateObj);
  });
};

setInterval(update, UPDATE_WAIT_TIME);
*/
