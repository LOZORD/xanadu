import _ from 'lodash';
import Path from 'path';
import gen from 'random-seed';
import Http from 'http';
import Express from 'express';
import IoFunction from 'socket.io';
import Game from '../game/game.js';

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

    this.gameNS.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  createDebugServer() {
    console.log('Launching the debug server...');
    this.debugNS.on('connection', (socket) => {
      socket.on('get', () => {
        socket.emit('debug-update', this.players
          .map(player => JSON.stringify(player.getDetails()))
          .join('\n'));
      });
    });
  }

  handleConnection(socket) {
    // when people connect...
    if (this.game.isAcceptingPlayers()) {
      this.acceptSocket(socket);
    } else {
      this.rejectSocket(socket);
    }
  }

  acceptSocket(socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);
    let { game } = this.game.addPlayer(socket.id);
    this.game = game;

    // when people send _anything_ from the client
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);

      this.handleMessage(messageObj, socket);
    });

    // when people disconnect
    socket.on('disconnect', () => {
      if (this.game.hasPlayer(socket.id)) {
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

  getSocket(socketId, server = this) {
    return _.find(server.sockets, (s) => s.id === socketId);
  }

  removePlayer(socketId, server = this) {
    return server.game.removePlayer(socketId);
  }

  removeSocket(socketId, server = this) {
    server.sockets = _.filter(server.sockets, (socket) => socket.id !== socketId);
  }

  handleMessage(messageObj, socket) {
    if (this.game.isRunning()) {
      // TODO
    } else {
      this.game.handleMessage(messageObj, this.game.getPlayer(socket.id))
        .forEach((msg) => this.sendMessage(msg, socket));
    }
  }

  // Reason for `createGame`: we may want one server but many games!
  createGame() {
    return new Game({
      rng: gen(this.seed),
      maxPlayers: 8
    });
  }

  sendMessage(response) {
    if (response.type === 'broadcast') {
      const toSocket = this.getSocket(response.from.id);
      toSocket.broadcast.emit('message', response.toJSON());
      toSocket.emit('message', response.toJSON());
      /*
    } else if (['chat', 'shout'].indexOf(response.type) > -1) {
      const receivingSockets = _.map(response.to, (socketId) => this.getSocket(socketId));
      _.forEach(receivingSockets, (socket) => {
        socket.emit('message', response.toJSON(socket.id));
      });
      */
    } else {
      this.getSocket(response.to.id).emit('message', response.toJSON());
      if (response.from) {
        this.getSocket(response.from.id).emit('message', response.toJSON());
      }
    }
  }
}
