import _ from 'lodash';
import Path from 'path';
import gen from 'random-seed';
import Http from 'http';
import Express from 'express';
import IoFunction from 'socket.io';

import Game from '../game/game.js';
import Player, { PLAYER_STATES } from '../game/player';

export default class Server {
  constructor(maxPlayers = 16, debug = true, port = 3000, seed = Date.now()) {
    this.expressApp = Express();
    this.httpServer = Http.Server(this.expressApp);
    this.io         = IoFunction(this.httpServer);
    this.port       = port;

    this.gameNS = this.io.of('/game');
    // TODO: Don't serve debug page if debugging is off
    if (debug) {
      this.debugNS = this.io.of('/debug');
      console.log('wat');
      this.createDebugServer();
    }

    this.ns         = '/';
    this.seed       = seed;
    this.sockets = [];
    this.players = [];
    this.maxPlayers = maxPlayers;
    // TODO: create `game` and treat it as a blackbox
    // i.e. call `createGame` --> we may want one server but many games!
    this.game = null;
    // TODO: this should be determined by the game and not the server
    this.gameRunning = false;

    this.createServer();
  }

  createServer () {
    const NODE_MODULES = Path.join(__dirname, '..', '..', 'node_modules');
    const PATHS = {
      CLIENT: Path.join(__dirname, '..', 'client'),
      NODE_MODULES: NODE_MODULES,
      JQUERY: Path.join(NODE_MODULES, 'jquery', 'dist'),
      BOOTSTRAP: Path.join(NODE_MODULES, 'bootstrap', 'dist')
    };

    this.expressApp.use(Express.static(PATHS.CLIENT));
    this.expressApp.use('/jquery', Express.static(PATHS.JQUERY));
    this.expressApp.use('/bootstrap', Express.static(PATHS.BOOTSTRAP));

    this.httpServer.listen(this.port, () => {
      console.log(`XANADU SERVER listening on port ${ this.port }`);
    });

    this.gameNS.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  createDebugServer() {
    console.log('Launching the debug server...');
    this.debugNS.on('connection', (socket) => {
      socket.on('get', () => {
        socket.emit('update', this.players
          .map(player => player.debugString())
          .join('\n'));
      });
    });
  }

  handleConnection(socket) {
    // when people connect...
    if (this.isAcceptingPlayers()) {
      this.acceptSocket(socket);

      // when people send _anything_ from the client
      socket.on('message', (messageObj) => this.handleMessage(messageObj, socket));

      // when people disconnect
      socket.on('disconnect', () => {
        const player = this.getPlayer(socket.id);
        if (player) {
          this.removePlayer(socket.id);
          console.log(`\tRemoved player with id: ${ player.id }`);
          console.log(`user ${ socket.id + '--' + player.name } disconnected`);
          // FIXME: socket/player communication needs to be redone
          socket.broadcast.emit(`${ player.name } has left the game.`);
        } else {
          console.log(`Unrecognized socket ${ socket.id } disconnected`);
        }
      });

      socket.emit('request-name');
    } else {
      this.rejectSocket(socket);
    }
  }

  acceptSocket(socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);
    // TODO: don't add another listener!
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);
    });
    this.addPlayer(socket.id);
  }

  rejectSocket(socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('message', {
      speaker: 'Xanadu',
      message: 'Sorry, the game is full!',
      type: 'message'
    });
    socket.emit('rejected-from-room');
  }

  // TODO: this.gameRunning -> this.game.hasStarted or w/e
  isAcceptingPlayers() {
    return !this.gameRunning && this.players.length < this.maxPlayers;
  }

  addPlayer(socketId) {
    this.players.push(new Player(socketId));
  }

  getPlayer(socketId) {
    return _.find(this.players, (p) => p.id === socketId);
  }

  getPlayerByName(name) {
    return _.find(this.players, (p) => p.name === name);
  }

  getSocket(socketId) {
    return _.find(this.sockets, (s) => s.id === socketId);
  }

  removePlayer(socketId) {
    this.players = this.players.filter((p) => p.id !== socketId);
  }

  handleMessage(messageObj, socket) {
    if (this.gameRunning) {
      // TODO
    } else {
      const player = this.getPlayer(socket.id);
      if (player.state === PLAYER_STATES.ANON) {
        player.name = messageObj.msg;
        player.state = PLAYER_STATES.NAMED;
        socket.emit('message', {
          speaker: 'Xanadu',
          message: `Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`,
          type: 'message'
        });
      } else {
        const words = messageObj.msg.split(" ");
        switch (words[0]) {
          case 'whisper':
          {
            const recipient = this.getPlayerByName(words[1]);
            if (recipient) {
              const message = {
                speaker: player.name,
                message: words.splice(2).join(" "),
                type: 'whisper'
              };
              this.getSocket(recipient.id).emit('message', message);
              socket.emit('message', {
                ...message,
                type: 'sent-message',
                to: words[1]
              });
            }
            break;
          }
          case 'broadcast':
          {
            const message = {
              speaker: player.name,
              message: words.splice(1).join(" "),
              type: 'broadcast'
            };
            socket.broadcast.emit('message', message);
            socket.emit('message', message);
            break;
          }
          default:
          {
            // do nothing
            break;
          }
        }
      }
    }
  }

  createGame() {
    this.game = new Game(this.players, { dimension: 16 }, gen(Date.now()));
  }
}
