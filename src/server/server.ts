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
import * as Responses from '../game/messaging';

const MUTATE = true;
const DO_NOT_MUTATE = false;

export default class Server {
  public expressApp: Express.Express;
  public httpServer: Http.Server;
  public io: SocketIO.Server;
  public port: number;
  public currentContext: Context;
  public sockets: SocketIO.Socket[];
  public gameNS: SocketIO.Namespace;
  public debugNS: SocketIO.Namespace;
  public seed: Gen.seedType;
  public maxPlayers: number;
  //constructor(kwargs = { maxPlayers: 8, debug: true, port: 3000, seed: Date.now() }) {
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
          .map(player => JSON.stringify(player.getDebugDetails(), null, 2))
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
      this.currentContext = new Game({
        players: this.currentContext.players,
        maxPlayers: this.maxPlayers,
        rng: Gen(this.seed)
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
  acceptSocket(socket: SocketIO.Socket) {
    console.log(`Server accepted socket ${ socket.id }`);
    this.sockets.push(socket);

    this.addPlayer(socket.id, MUTATE);

    // when people send _anything_ from the client
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj) => {
      console.log(`Socket ${ socket.id }: ${ JSON.stringify(messageObj) }`);

      let { isReadyForUpdate, isReadyForNextContext } = this.handleMessage(messageObj, socket);

      if (isReadyForUpdate) {
        const updatedContext = this.currentContext.update();
        this.currentContext = updatedContext;
      }

      // TODO: do something with the context's player lists
      if (isReadyForNextContext) {
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

  rejectSocket(socket: SocketIO.Socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('rejected-from-room');
  }

  getSocket(socketId: string, server = this) {
    return _.find(server.sockets, (s) => s.id === socketId);
  }

  addPlayer(socketId: string, shouldMutate = DO_NOT_MUTATE) {
    const result = this.currentContext.addPlayer(socketId);

    if (shouldMutate) {
      this.currentContext = result.context;
    }

    return result;
  }

  removePlayer(socketId: string, shouldMutate = DO_NOT_MUTATE) {
    const result = this.currentContext.removePlayer(socketId);

    if (shouldMutate) {
      this.currentContext = result.context;
    }

    return result;
  }

  removeSocket(socketId: string) {
    this.sockets = _.filter(this.sockets, (socket) => socket.id !== socketId);
  }

  handleMessage(messageObj, socket: SocketIO.Socket) {
    this.currentContext.handleMessage(messageObj, this.currentContext.getPlayer(socket.id))
      .forEach((msg) => this.sendMessage(msg, socket));

    return {
      isReadyForNextContext: this.currentContext.isReadyForNextContext(),
      isReadyForUpdate: this.currentContext.isReadyForUpdate()
    };
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

  sendMessage(response: Responses.Dispatch) {
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
    _.forEach(idsToDetails, (details, socketId) => {
      const recipientSocket = this.getSocket(socketId);

      if (!recipientSocket) {
        throw new Error(`Unknown socket: ${ socketId }`);
      }

      recipientSocket.emit('details', details);
    });
  }
}
