import _ from 'lodash';
import Path from 'path';
import gen from 'random-seed';
import Http from 'http';
import Express from 'express';
import IoFunction from 'socket.io';
import Game from '../game/game.js';
import Lobby from '../context/lobby';
import Response, * as Responses from '../game/messaging';

const MUTATE = true;
const DO_NOT_MUTATE = false;

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
    //this.game = this.createGame();
    this.currentContext = this.createLobby();

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
          .map(player => JSON.stringify(player.getDebugDetails()))
          .join('\n'));
      });
    });
  }

  handleConnection(socket) {
    // when people connect...
    if (this.currentContext.isAcceptingPlayers()) {
      this.acceptSocket(socket);
    } else {
      this.rejectSocket(socket);
    }
  }
  changeContext() {
    if (this.currentContext instanceof Lobby) {
      this.currentContext = new Game({
        players: this.currentContext.players,
        maxPlayers: this.maxPlayers,
        rng: gen(this.seed)
      });
      // message players that the game has begun
      this.sendMessage(new Responses.GameBroadcastResponse(
            'THE GAME HAS BEGUN!'
      ));
      // send details to players
      this.sendDetails();
      // TODO: start the round interval update
    } else {
      this.currentContext = new Lobby({
        players: this.currentContext.players,
        maxPlayers: this.maxPlayers
      });
    }
  }
  acceptSocket(socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);

    this.addPlayer(socket.id, MUTATE);

    // when people send _anything_ from the client
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);

      let readyForNextContext = this.handleMessage(messageObj, socket);

      // TODO: do something with the context's player lists
      if (readyForNextContext) {
        this.changeContext();
      }
    });

    // when people disconnect
    socket.on('disconnect', () => {
      if (this.currentContext.hasPlayer(socket.id)) {
        const { player } = this.removePlayer(socket.id, MUTATE);
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

  addPlayer(socketId, shouldMutate = DO_NOT_MUTATE) {
    const result = this.currentContext.addPlayer(socketId);

    if (shouldMutate) {
      this.currentContext = result.context;
    }

    return result;
  }

  removePlayer(socketId, shouldMutate = DO_NOT_MUTATE) {
    const result = this.currentContext.removePlayer(socketId);

    if (shouldMutate) {
      this.currentContext = result.context;
    }

    return result;
  }

  removeSocket(socketId) {
    this.sockets = _.filter(this.sockets, (socket) => socket.id !== socketId);
  }

  handleMessage(messageObj, socket) {
    this.currentContext.handleMessage(messageObj, this.currentContext.getPlayer(socket.id))
      .forEach((msg) => this.sendMessage(msg, socket));

    return this.currentContext.isReadyForNextContext();
  }

  // Reason for `createGame`: we may want one server but many games!
  createGame() {
    return new Game({
      rng: gen(this.seed),
      maxPlayers: this.maxPlayers
    });
  }

  createLobby() {
    return new Lobby({
      maxPlayers: this.maxPlayers
    });
  }

  sendMessage(response) {
    if (!(response instanceof Response)) {
      throw new Error(`Expected ${ JSON.stringify(response) } to be an instance of Response!`);
    }

    if (response instanceof Responses.BroadcastResponse) {
      if (response instanceof Responses.GameBroadcastResponse) {
        // send to ALL sockets
        this.gameNS.emit('message', response.toJSON());
      } else {
        let broadcastingSocket = this.getSocket(response.from.id);
        broadcastingSocket.broadcast.emit('message', response.toJSON());
      }
    } else if (response instanceof Responses.MultiplePlayerResponse) {
      response.to.forEach((recipient) => {
        const recipientSocket =  this.getSocket(recipient.id);

        recipientSocket.emit('message', response.toJSON(recipient.id));
      });
    } else {
      const toSocket = this.getSocket(response.to.id);

      if (!toSocket) {
        throw new Error(`Could not find socket with id ${ response.to.id }; to: ${ JSON.stringify(response.to) }`);
      }

      toSocket.emit('message', response.toJSON());
    }
  }
  sendDetails() {
    const idsToDetails = this.currentContext.getPlayerDetails();
    //console.log(JSON.stringify(idsToDetails));
    _.forEach(idsToDetails, (details, socketId) => {
      const recipientSocket = this.getSocket(socketId);

      if (!recipientSocket) {
        throw new Error(`Unknown socket: ${ socketId }`);
      }

      recipientSocket.emit('details', details);
    });
  }
}
