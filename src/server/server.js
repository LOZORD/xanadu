import _ from 'lodash';
import Path from 'path';
import gen from 'random-seed';
import Http from 'http';
import Express from 'express';
import IoFunction from 'socket.io';
import Game from '../game/game.js';
import Player, { PLAYER_STATES } from '../game/player';
import ResponseFactory from './responses/factory';

export default class Server {
  constructor(kwargs = { maxPlayers: 8, debug: true, port: 3000, seed: Date.now() }) {
    // using this default param + destructuring strategy,
    // we can get kwargs beyond the required ones,
    // while also neatly getting the required ones!
    let { maxPlayers, debug, port, seed } = kwargs;

    this.expressApp = Express();
    this.httpServer = Http.Server(this.expressApp);
    this.io         = IoFunction(this.httpServer);
    this.port       = port;

    this.gameNS = this.io.of('/game');

    // TODO: Don't serve debug page if debugging is off
    if (debug) {
      this.debugNS = this.io.of('/debug');
      this.createDebugServer();
    }

    this.ns         = '/';
    this.seed       = seed;
    this.sockets = [];
    this.game = this.createGame();

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

    // need to pass a function literal so `this` is correct
    this.gameNS.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  createDebugServer() {
    console.log('Launching the debug server...');
    this.debugNS.on('connection', (socket) => {
      socket.on('get', () => {
        socket.emit('debug-update', this.players
          .map(player => player.debugString())
          .join('\n'));
      });
    });
  }

  handleConnection(socket) {
    // when people connect...
    if (this.isAcceptingPlayers()) {
      this.acceptSocket(socket);
    } else {
      this.rejectSocket(socket);
    }
  }

  acceptSocket(socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);
    // XXX: we also have access to the added player
    let { game } = this.addPlayer(socket.id);
    this.game = game;

    // when people send _anything_ from the client
    // TODO: pass the message onto the game
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);

      this.handleMessage(messageObj, socket)

      // XXX: eventually something like:
      /* ...
       * let response = this.game.respondToMessage(message);
       * ...
       */
    });

    // when people disconnect
    socket.on('disconnect', () => {
      if (this.hasPlayer(socket.id)) {
        let { player } = this.removePlayer(socket.id);
        console.log(`\tPlayer ${ player.id + '--' + player.name } disconnected`);
        // FIXME: socket/player communication needs to be redone
        socket.broadcast.emit(`${ player.name } has left the game.`);
      } else {
        console.log(`Unrecognized socket ${ socket.id } disconnected`);
      }
    });

    // XXX: check if this is even being used
    socket.emit('request-name');
  }

  rejectSocket(socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('rejected-from-room');
  }

  isAcceptingPlayers(server = this) {
    //return !this.gameRunning && this.players.length < this.maxPlayers;
    return server.game.isAcceptingPlayers();
  }

  addPlayer(socketId, server = this) {
    //this.players.push(new Player(socketId));
    return server.game.addPlayer(socketId);
  }

  hasPlayer(socketId, server = this) {
    return server.game.hasPlayer(socketId);
  }

  getPlayer(socketId, server = this) {
    //return _.find(this.players, (p) => p.id === socketId);
    return server.game.getPlayer(socketId);
  }

  getPlayerByName(name, server = this) {
    //return _.find(this.players, (p) => p.name === name);
    return server.game.getPlayerByName(name);
  }

  getSocket(socketId, server = this) {
    return _.find(server.sockets, (s) => s.id === socketId);
  }

  removePlayer(socketId, server = this) {
    //this.players = this.players.filter((p) => p.id !== socketId);
    return server.game.removePlayer(socketId);
  }

  removeSocket(socketId, server = this) {
    server.sockets = _.filter(server.sockets, (socket) => socket.id !== socketId);
  }
  // TODO: eventuallty this should be moved into the Game class!
  handleMessage(messageObj, socket) {
    if (this.gameRunning) {
      // TODO
    } else {
      const player = this.getPlayer(socket.id);
      if (player.state === PLAYER_STATES.ANON) {
        player.name = messageObj.msg;
        player.state = PLAYER_STATES.NAMED;

        this.sendMessage(
            (new ResponseFactory.ECHO({ message: player.name })),
            socket
        );

        this.sendMessage(
            (new ResponseFactory.GAME({
              message: `Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`
            })),
            socket
        );

        /*
        socket.emit('message', (new ResponseFactory.ECHO({
          message: player.name
        })).toJSON());

        let welcomeResponse = new ResponseFactory.GAME({
          message: `Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`
        });

        socket.emit('message', welcomeResponse.toJSON());
        /* we eventually want something like this:
        socket.emit('message', {
          speaker: 'Xanadu',
          message: `Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`,
          type: 'message'
        });
        */
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

  // Reason for `createGame`: we may want one server but many games!
  createGame() {
    return new Game({
      rng: gen(this.seed),
      maxPlayers: 8,
      server: this
    });
  }

  sendMessage(response, toSocket = null) {
    if (!toSocket && response.to) {
      toSocket = _.find(this.sockets, (socket) => socket.id === response.to);
    }

    if (response instanceof ResponseFactory.BROADCAST) {
      this.io.broadcast.emit('message', response.toJSON());
    } else {
      toSocket.emit('message', response.toJSON());
    }
  }
}
