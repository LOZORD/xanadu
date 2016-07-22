///<xreference path="./random-seed.d.ts" />
// ^^ fix this ^^
import * as _ from 'lodash';
import * as Path from 'path';
import * as Gen from 'random-seed';
import * as Http from 'http';
import * as Express from 'express';
import * as SocketIO from 'socket.io';
import Context from '../context/context';
import Game from '../context/game';
import Lobby from '../context/lobby';
import { Message, show as showMessage, createGameMessage } from '../game/messaging';
import { Player, debugDetails as playerDebugDetails, playerDetails } from '../game/player';

export default class Server {
  expressApp: Express.Express;
  httpServer: Http.Server;
  io: SocketIO.Server;
  port: number;
  currentContext: Context;
  sockets: SocketIO.Socket[];
  gameNS: SocketIO.Namespace;
  debugNS: SocketIO.Namespace;
  seed: Gen.seedType;
  maxPlayers: number;
  constructor(maxPlayers = 8, debug = true, port = 3000, seed = Date.now().toString()) {
    this.expressApp = Express();
    this.httpServer = Http.createServer(this.expressApp);
    this.io         = SocketIO(this.httpServer);
    this.port       = port;

    this.gameNS = this.io.of('/game');

    // TODO: Don't serve debug page if debugging is off
    if (debug) {
      this.debugNS = this.io.of('/debug');
      this.createDebugServer();
    }

    this.seed       = seed;
    this.sockets = [];
    // server starts out as having a lobby context
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
        socket.emit('debug-update', this.currentContext.players
          // pretty print the json
          .map(player => JSON.stringify(playerDebugDetails(player), null, 2))
          .join('\n'));
      });
    });
  }

  handleConnection(socket: SocketIO.Socket) {
    // when people connect...
    if (this.currentContext.isAcceptingPlayers()) {
      this.acceptSocket(socket);
    } else {
      this.rejectSocket(socket);
    }
  }
  changeContext() {
    if (this.currentContext instanceof Lobby) {
      // FIXME: what about passing the rng/seed?
      this.currentContext = this.createGame();
      /*
      this.currentContext = new Game({
        players: this.currentContext.players,
        maxPlayers: this.maxPlayers,
        rng: Gen(this.seed)
      });
      */
      // message players that the game has begun
      this.sendMessage(
        createGameMessage('THE GAME HAS BEGUN!', this.currentContext.players)
      );

      // send details to players
      this.sendDetails();
      // TODO: start the round interval update
    } else {
      this.currentContext = this.createLobby();
    }
  }
  acceptSocket(socket: SocketIO.Socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);

    this.addPlayer(socket.id);

    // when people send _anything_ from the client
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);

      let { isReadyForUpdate, isReadyForNextContext } = this.handleMessage(messageObj, socket);

      if (isReadyForUpdate) {
        /* FIXME: context is missing an `update` function
        const updatedContext = this.currentContext.update();
        this.currentContext = updatedContext;
        */
      }

      // TODO: do something with the context's player lists
      if (isReadyForNextContext) {
        this.changeContext();
      }
    });

    // when people disconnect
    socket.on('disconnect', () => {
      if (this.currentContext.hasPlayer(socket.id)) {
        const removedPlayer = this.removePlayer(socket.id);
        console.log(`\tPlayer ${ removedPlayer.id + '--' + removedPlayer.name } disconnected`);
        // FIXME: socket/player communication needs to be redone
        socket.broadcast.emit(`${ removedPlayer.name } has left the game.`);
      } else {
        console.log(`Unrecognized socket ${ socket.id } disconnected`);
      }
    });

    // XXX: check if this is even being used
    socket.emit('request-name');
  }

  rejectSocket(socket: SocketIO.Socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('rejected-from-room');
  }

  getSocket(socketId: string, server = this) {
    return _.find(server.sockets, (s) => s.id === socketId);
  }

  addPlayer(socketId: string): void {
    this.currentContext.addPlayer(socketId);
  }

  removePlayer(socketId: string): Player {
    return this.currentContext.removePlayer(socketId);
  }

  removeSocket(socketId: string) {
    this.sockets = _.filter(this.sockets, (socket) => socket.id !== socketId);
  }

  handleMessage(messageObj, socket: SocketIO.Socket) {

    messageObj.player = this.currentContext.getPlayer(socket.id);

    this.currentContext.handleMessage(messageObj)
      .forEach(message => this.sendMessage(message));

    return {
      isReadyForNextContext: this.currentContext.isReadyForNextContext(),
      // FIXME: context is missing a `isReadyForUpdate` function
      isReadyForUpdate: false /*this.currentContext.isReadyForUpdate()*/
    };
  }

  // Reason for `createGame`: we may want one server but many games!
  createGame() {
    return new Game(this.maxPlayers, this.currentContext.players);
  }

  createLobby() {
    return new Lobby(this.maxPlayers, this.currentContext.players);
  }

  sendMessage(message: Message) {
    const messageJSON = showMessage(message);
    const recipients = message.to;

    recipients.forEach(recipientPlayer => {
      const recipientSocket = this.getSocket(recipientPlayer.id);

      if (!recipientSocket) {
        throw new Error(`Could not find socket with id: ${ recipientPlayer.id }`);
      }

      recipientSocket.emit('message', messageJSON);
    });
  }
  sendDetails() {
    this.currentContext.players.forEach(player => {
      this.getSocket(player.id).emit('details', playerDetails(player));
    });
  }
}
