let gen = require('random-seed');
let express = require('express');
//let _app = express();
//let _http = require('http').Server(_app);
//let _io = require('socket.io')(_http);
let path = require('path');
let ioFunc = require('socket.io');
let _http = require('http');
let _ = require('lodash');
let Emitter = require('events');
let Player  = require('../common/player');
class Game extends Emitter {
  constructor(args = {}) {
    super(args);
    // set up server stuff
    this.expressApp = express();
    this.port = args.port || 3000;
    /*
    _http.listen(this.port, () => {
      console.log(`GAME LISTENING ON PORT ${this.port}`);
    });
    */
    let serverElements = this.createServer();
    this.ns = args.ns || '/';
    //this.room = args.room || 'MAIN_ROOM';
    this.maxPlayers = args.maxPlayers || 8;

    // stuff for the actual game
    this.players = args.players || [];
    this.map = this.generateMap();
    this.hasStarted = false;
    this.hasEnded   = false;
    this.turnNumber = 0;
    this.seed       = args.seed || Date.now();
    this.rng        = gen(this.seed);
  }
  generateMap(N = 16) {
    // TODO: generate an NxN dungeon
    let oneDim = new Array(16);

    oneDim.forEach((_elem, i) => {
        oneDim[i] = new Array(16);
    });

    // generation logic would go here...
  }
  isAcceptingPlayers() {
    return !this.hasStared;
  }
  play() {
    console.log('\t\tPLAYING...');
  }
  update() {
    // the main update ("tick") logic will go here
  }
  /*
  setupMap(socketRoom, map) {
    //TODO
    // for now, do nothing
  }
  */
  createServer() {
    //this.expressApp = express();
    let httpServer = _http.Server(this.expressApp);
    let io = ioFunc(httpServer);

    //let pathToClientDir = [__dirname, '..', 'client'];

    // serve the client stuff
    this.expressApp.use(express.static(path.join(
      __dirname, '..', 'client'
    )));

    const NODE_MODULES_DIR = path.join(
      __dirname, '..', '..', 'node_modules'
    );

    this.expressApp.use('/jquery', express.static(path.join(
      NODE_MODULES_DIR, 'jquery', 'dist'
    )));

    this.expressApp.use('/bootstrap', express.static(path.join(
      NODE_MODULES_DIR, 'bootstrap', 'dist'
    )));

    httpServer.listen(this.port, () => {
      console.log(`Xanadu game listening on port ${ this.port }`);
    });

    // now add the socket.io listeners
    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        if (socket.player) {
          console.log(`user ${ socket.player.id() + '--' + socket.player.name } disconnected`);
        } else {
          console.log(`anon user ${ socket.id } disconnected`);
        }

        // remove them from this list of players
        _.remove(this.players, (player) => player.id() == socket.player.id());
      });

      if (this.players.length < this.maxPlayers) {
        this.acceptSocket(socket);
      } else {
        this.rejectSocket(socket);
      }
    });

    return {
      http: httpServer,
      io: io
    };
  }
  acceptSocket(socket) {
    // XXX: important? : socket.join(this.mainRoom);
    socket.player = new Player({
      socket: socket,
      game: this
    });
    this.players.push(socket.player);
    let spotsLeft = this.maxPlayers - this.players.length;
    console.log('\taccepted socket');
    console.log(`\t${ spotsLeft } / ${ this.maxPlayers } spots left`);
    socket.emit('request-name'); // might not be nec.
  }
  rejectSocket(socket) {
    console.log(`socket ${ socket.id } rejected -- game full`);
    socket.emit('rejected-from-room');
  }
  message(player, message) {

    player.echo(message);

    if (player.state === Player.PLAYER_STATES.ANON && !this.hasStarted) {
      //TODO: first check if name is unique
      player.name = message;
      player.state = Player.PLAYER_STATES.NAMED;
      //this.emit('player-named', player);
      player.message(`Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`);
      player.broadcast(`${ player.name } has joined the game!`);
    } else if (player.state === Player.PLAYER_STATES.NAMED && !this.hasStarted) {
      // TODO: fix pre-game chat (open to everyone/global/unlimited)
      if (message.toLowerCase() === 'ready') {
        player.state = Player.PLAYER_STATES.READY;
        player.message('The game will start when everyone is ready...');
        player.broadcast(`${ player.name } is ready!`);
        this.attemptToStart();
      } else {
        // anyone talk before the game starts
        player.broadcast(message);
      }
    } else if (player.state == Player.PLAYER_STATES.PLAYING && this.hasStarted) {
      this.handleMessage(message, player);
    } else {
      return null;
    }
  }
  handleMessage(message, player) {
    // TODO
    console.log('TODO: handleMessage', message, player);
  }
  attemptToStart() {
    console.log(this.players.map(player => [player.name, player.state]));
    if (this.players.every((player) => player.state === Player.PLAYER_STATES.READY)) {
      this.hasStarted = true;
      console.log('GAME STARTED!');
    }
  }
}

module.exports = Game;
