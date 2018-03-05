import * as _ from 'lodash';
import * as Path from 'path';
import * as Http from 'http';
import { ListenOptions } from 'net';
import * as Express from 'express';
import * as Socket from '../socket';
// import * as SocketIO from 'socket.io';
import { Context, ClientMessage } from '../context/context';
import Game, { isContextGame } from '../context/game';
import Lobby, { isContextLobby } from '../context/lobby';
import { Message, show as showMessage, createGameMessage } from '../game/messaging';
import * as Player from '../game/player';
import { Promise } from 'es6-promise';
import { Logger } from '../logger';
import { Seed } from '../rng';
import * as Map from '../game/map/map';
import describeRoom from '../game/map/describeRoom';

export default class Server<S extends Socket.Server> {
  static readonly LOCALHOST_ADDRESS = '127.0.0.1';
  static readonly REMOTE_CONNECTION_ADDRESS = '0.0.0.0';
  expressApp: Express.Express;
  httpServer: Http.Server;
  io: S;
  currentContext: Context<Player.Player>;
  sockets: Socket.Socket[];
  gameNS: Socket.Namespace;
  debugNS?: Socket.Namespace;
  seed: Seed;
  maxPlayers: number;
  logger: Logger;
  constructor(
    socketServerProducer: Socket.ServerCreator<S>, maxPlayers: number,
    seed: Seed, debug: boolean, logger: Logger
  ) {
    this.maxPlayers = maxPlayers;
    this.expressApp = Express();
    this.httpServer = Http.createServer(this.expressApp);
    this.io = socketServerProducer(this.httpServer);
    this.logger = logger;

    this.gameNS = this.io.of('/game');

    if (debug) {
      this.debugNS = this.io.of('/debug');
    }

    this.seed = seed;
    this.sockets = [];
    // server starts out as having a lobby context
    this.currentContext = this.createEmptyLobby();
  }

  // default the hostname to localhost
  start(port: number, hostname = Server.LOCALHOST_ADDRESS): Promise<this> {
    this.logger.log('debug', 'Starting server at ', (new Date()).toString());
    return new Promise<this>((resolve, _reject) => {
      if (this.debugNS) {
        this.createDebugServer();
      }

      this.createServer(port, hostname);

      resolve(this);
    });
  }

  stop(): Promise<this> {
    this.logger.log('debug', 'Stopping server at ', (new Date()).toString());
    return new Promise<this>((resolve) => {
      const port = this.address.port;

      this.getCurrentSockets().forEach(socket => {
        // TODO: refactor this so no undefined check.
        if (socket) {
          socket.emit('server-stopped', {});
          socket.disconnect(true);
        }
      });

      this.httpServer.close(() => {
        this.logger.log('debug', `HTTP SERVER CLOSED! (PORT ${port})`);
        resolve(this);
      });
    });
  }

  get address() {
    return this.httpServer.address();
  }

  get listening(): boolean {
    // Backwards compatibility for Node v4.
    // `this.address` will be null if the server is not listening.
    return this.httpServer.listening || Boolean(this.address);
  }

  getCurrentPlayers() {
    return this.currentContext.players;
  }

  getCurrentSockets() {
    return this.getCurrentPlayers().map(player => this.getSocket(player.id));
  }

  createServer(port: number, hostname: string) {
    const NODE_MODULES = Path.join(__dirname, '..', '..', 'node_modules');
    const PATHS = {
      CLIENT_ASSETS: Path.join(__dirname, '..', '..', 'assets', 'client'),
      CLIENT_SCRIPTS: Path.join(__dirname, '..', 'client'),
      NODE_MODULES,
      // TODO(lozord): Remove jQuery.
      JQUERY: Path.join(NODE_MODULES, 'jquery', 'dist')
    };

    this.expressApp.use(Express.static(PATHS.CLIENT_ASSETS));
    this.expressApp.use('/scripts', Express.static(PATHS.CLIENT_SCRIPTS));
    this.expressApp.use('/jquery', Express.static(PATHS.JQUERY));

    const opts: ListenOptions = { port, host: hostname };

    this.httpServer.listen(opts, () => {
      this.logger.log('debug', `Server is listening on port: ${this.address.port}`);
    });

    this.gameNS.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  createDebugServer() {
    this.logger.log('debug', 'Launching the debug server...');
    if (this.debugNS) {
      this.debugNS.on('connection', (socket) => {
        socket.on('get', () => {
          let dataToSend: any = {};
          dataToSend.playerData =
            this.currentContext.players.map((player) => Player.debugDetails(player));

          if (this.currentContext instanceof Game) {
            dataToSend.gameMap = Map.mapToString((this.currentContext as Game).map);
            dataToSend.turnNumber = (this.currentContext as Game).turnNumber;
          }

          socket.emit('debug-update', JSON.stringify(dataToSend, null, 2));
        });
      });
    }
  }

  // when people connect...
  handleConnection(socket: Socket.Socket) {
    this.setClientLogLevelToDebug(socket);
    if (this.currentContext.isAcceptingPlayers()) {
      this.acceptSocket(socket);
    } else {
      this.rejectSocket(socket);
    }
  }

  setClientLogLevelToDebug(socket: Socket.Socket) {
    socket.emit('debug', Boolean(this.debugNS));
  }

  // and when they disconnect...
  handleDisconnection(socket: Socket.Socket) {
    const removedPlayer = this.removePlayer(socket.id);
    if (removedPlayer) {
      this.logger.log('info', `\tPlayer ${removedPlayer.id + '--' + removedPlayer.name} disconnected`);

      if (!Player.isAnon(removedPlayer)) {
        const disconnectMessage =
          this.currentContext.broadcastFromPlayer(`${removedPlayer.name} has left the game.`, removedPlayer);

        this.sendMessage(disconnectMessage);

        this.sendRoster();
      }

      // TODO: current context might need to be tested for update
      // e.g. all but leaving player have given their commands
    } else {
      this.logger.log('info', `Unrecognized socket ${socket.id} disconnected`);
    }
  }

  changeContext() {
    if (isContextLobby(this.currentContext)) {
      this.currentContext = this.createGame(this.currentContext.players);

      // message players that the game has begun
      this.sendMessage(
        createGameMessage('THE GAME HAS BEGUN!', this.currentContext.players)
      );

      this.getCurrentSockets().forEach(socket => {
        if (socket) {
          socket.emit('context-change', 'Game');
        }
      });

      const gameMap = (this.currentContext as Game).map;

      const startingRoom = (this.currentContext as Game).startingRoom;

      const startingRoomDescription = describeRoom(startingRoom, gameMap);

      this.sendMessage(
        createGameMessage(startingRoomDescription, this.currentContext.players)
      );

      // send details to players
      this.sendDetails();
    } else {
      this.currentContext = this.createLobby(this.currentContext.players);

      this.getCurrentSockets().forEach(socket => {
        if (socket) {
          socket.emit('context-change', 'Lobby');
        }
      });
    }

    this.sendRoster();
  }
  acceptSocket(socket: Socket.Socket) {
    this.logger.log('info', `Server accepted socket ${socket.id}`);
    this.sockets.push(socket);

    this.addPlayer(socket.id);

    this.sendRoster();

    // when people send _anything_ from the client
    // the game handles the message, and then passes the server a response
    // then, the server sends the response to the client
    socket.on('message', (messageObj: ClientMessage<Player.Player>) => {
      this.handleMessage(messageObj, socket);
    });

    // when people disconnect
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  rejectSocket(socket: Socket.Socket) {
    const contextStr = this.currentContext instanceof Lobby ? 'lobby' : 'game';
    const numPlayersStr = `(${this.currentContext.players.length}/${this.currentContext.maxPlayers} players)`;
    this.logger.log('info', `socket ${socket.id} rejected`, contextStr, numPlayersStr);
    socket.emit('rejected-from-room', {});
  }

  getSocket(socketId: string, server = this) {
    return _.find(server.sockets, (s) => s.id === socketId);
  }

  addPlayer(socketId: string): void {
    this.currentContext.addPlayer(socketId);
  }

  removePlayer(socketId: string): Player.Player | undefined {
    return this.currentContext.removePlayer(socketId);
  }

  handleMessage(messageObj: ClientMessage<Player.Player>, socket: Socket.Socket) {
    this.logger.log('debug', `Socket ${socket.id}: ${JSON.stringify(messageObj)}`);

    let { isReadyForUpdate, isReadyForNextContext } = this.delegateMessageAndDetectContextChanges(messageObj, socket);

    if (isReadyForUpdate) {
      const { messages, log } = this.currentContext.update();

      messages.forEach(message => this.sendMessage(message));
      log.forEach(logItem => this.logger.log('info', logItem));

      this.sendDetails();

      this.sendMessage(this.currentContext.broadcast('What is your next action?'));
    }

    if (isReadyForNextContext) {
      this.changeContext();
    }
  }

  delegateMessageAndDetectContextChanges(messageObj, socket: Socket.Socket) {

    messageObj.player = this.currentContext.getPlayer(socket.id);

    const beforeState = messageObj.player.state as Player.PlayerState;

    this.currentContext.handleMessage(messageObj)
      .forEach(message => this.sendMessage(message));

    const afterState = messageObj.player.state as Player.PlayerState;

    // if the player's state changed, or they've readied again
    if (beforeState !== afterState || afterState === 'Ready') {
      this.sendRoster();
    }

    return {
      isReadyForNextContext: this.currentContext.isReadyForNextContext(),
      isReadyForUpdate: this.currentContext.isReadyForUpdate()
    };
  }

  // Reason for `createGame`: we may want one server but many games!
  createGame(players: Player.Player[], seed: Seed = this.seed): Game {
    return new Game(this.maxPlayers, players, { seed });
  }

  createLobby(players: Player.Player[]): Lobby {
    return new Lobby(this.maxPlayers, players);
  }

  createEmptyLobby(): Lobby {
    return this.createLobby([]);
  }

  sendMessage(message: Message) {
    const messageJSON = showMessage(message);
    const recipients = message.to;

    recipients.forEach(recipientPlayer => {
      const recipientSocket = this.getSocket(recipientPlayer.id);

      if (!recipientSocket) {
        throw new Error(`Could not find socket with id: ${recipientPlayer.id}`);
      }

      recipientSocket.emit('message', messageJSON);
    });
  }
  sendDetails() {
    if (isContextGame(this.currentContext)) {
      this.currentContext.players.forEach(player => {
        const socket = this.getSocket(player.id);

        if (socket) {
          socket.emit('details', Player.playerDetails(player));
        } else {
          throw new Error(`Expected socket with id "${player.id}" to exist!`);
        }
      });
    } else {
      // do nothing
    }
  }
  sendRoster() {
    const rosterInformation = this.currentContext.getRosterData();

    this.getCurrentPlayers().forEach(player => {
      const socket = this.getSocket(player.id);

      if (socket) {
        socket.emit('player-info', Player.getPlayerInfo(player));
        socket.emit('roster', rosterInformation);
      } else {
        throw new Error(`Expected socket with id "${player.id}" to exist!`);
      }
    });
  }
}
