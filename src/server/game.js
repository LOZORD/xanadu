import gen      from 'random-seed';
import http     from 'http';
import express  from 'express';
import path     from 'path';
import ioFunc   from 'socket.io';
import _        from 'lodash';
import Emitter  from 'events';
import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';

const WITHOUT_NAME = false;

// TODO: one of the game parameters should be the number of modifiers randomly assigned
export default class Game extends Emitter {
  constructor(args = {}) {
    super(args);
    // set up server stuff
    this.expressApp = express();
    this.httpServer = http.Server(this.expressApp);
    this.io = ioFunc(this.httpServer);
    this.port = args.port || 3000;
    this.createServer();
    let debug = args.debug || true;
    if (debug) {
      this.debugServer();
    }
    this.ns = args.ns || '/';
    this.maxPlayers = args.maxPlayers || 8;
    this.seed       = args.seed || Date.now();
    this.rng        = gen(this.seed);

    // stuff for the actual game
    this.players = args.players || [];
    this.map = new Map({
      dimension: 16, // default to 16x16 grid
      seed: this.seed,
      rng:  this.rng
    });
    this.hasStarted = false;
    this.hasEnded   = false;
    this.turnNumber = 0;
  }
  isAcceptingPlayers() {
    return !this.hasStarted;
  }
  update() {
    this.turnNumber++;
    let UPDATE_WAIT_TIME = 1000 * 10; // ten seconds
    setTimeout(() => {
      // TODO: figure out how to async'ly gather moves from players
      // e.g. let moves = this.gatherMoves();
      let results = this.performMoves();

      this.sendUpdatesToClients(results);

      // when we're done, update again!
      this.update();
    }, UPDATE_WAIT_TIME);
  }
  sortMoves(players) {
    return _
      .chain(players)
      // 'capture' all player moves
      .map((player) => ({ player: player, move: player.nextMove }))
      // first sort by agility
      .sortBy('player.character.agility')
      // and then by time the move was made
      .sortBy('move.timeStamp')
      .value();
  }
  performMoves() {
    let sortedMoveObjs = this.sortMoves(this.players);

    // game state effects caused by the moves
    // these will be reported to the players AS MESSAGES
    // TODO: implement this!!!
    let moveResults = {};

    _.forEach(sortedMoveObjs, ({ player, move }) => {
      player.character.performMove(move);
    });

    return moveResults;
  }
  sendUpdatesToClients(results) {
    if (!results) {
      throw new Error(`Expected results to exist! Got: ${ results }!`);
    }

    _.forEach(this.players, (player) => {
      let id = player.id();
      let resultMessage = results[id];
      player.messageUpdates(resultMessage);
      player.updateDetails()
    });
  }
  createServer() {
    //this.expressApp = express();

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

    this.httpServer.listen(this.port, () => {
      console.log(`Xanadu game listening on port ${ this.port }`);
    });

    // socket namespace for the game
    var gameNS = this.io.of('/game');

    // now add the socket.io listeners
    gameNS.on('connection', (socket) => {
      socket.on('disconnect', () => {
        if (socket.player) {
          console.log(`user ${ socket.player.id() + '--' + socket.player.name } disconnected`);
          socket.player.broadcast(`${ socket.player.name } has left the game.`);
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
      httpServer: this.httpServer,
      io: gameNS
    };
  }
  debugServer() {
    console.log('\tDebugging is active!');
    var debugNS = this.io.of('/debug');
    debugNS.on('connection', (socket) => {
      socket.on('get', () => {
        socket.emit('update', this.players.map((p) => {
          return p.debugString();
        }).join('\n'));
      });
    });
  }
  acceptSocket(socket) {
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
  message(player, messageObj) {
    var message   = messageObj.msg;
    // var timeStamp = messageObj.ts; -> unused for now

    // always echo the message back to the player
    // TODO: move this to the bottom of the method
    // we may want to echo in a different manner
    // (e.g. whisper + style both to and from sockets)
    player.echo(message);

    if (player.state === PLAYER_STATES.ANON && !this.hasStarted) {
      //TODO: first check if name is unique
      player.name = message;
      player.state = PLAYER_STATES.NAMED;
      player.message(`Welcome to Xanadu ${ player.name }! Enter \`ready\` to start.`);
      player.broadcast(`${ player.name } has joined the game!`, WITHOUT_NAME);
    } else if (player.state === PLAYER_STATES.NAMED && !this.hasStarted) {
      if (message.toLowerCase() === 'ready') {
        player.state = PLAYER_STATES.READY;
        player.message('The game will start when everyone is ready...');
        player.broadcast(`${ player.name } is ready!`, WITHOUT_NAME);
        this.attemptToStart();
      } else {
        // anyone can talk to anyone before the game starts
        this.handleMessage(messageObj, player, {
          defaultTo: 'broadcast'
        });
      }
    } else if (player.state == PLAYER_STATES.PLAYING && this.hasStarted) {
      // TODO: set the player's nextMove if not a special command
      this.handleMessage(messageObj, player);
    } else {
      // do nothing
    }
  }
  handleMessage(messageObj, player, kwargs = {}) {
    // check if it's a special command
    var message   = messageObj.msg;
    // XXX: do something with timeStamp
    // e.g. to players attempt to grab the same item
    //var timeStamp = messageObj.ts;
    if (message.startsWith(':')) {
      let split = message.split(' ');

      let command = split[0];

      switch (command) {
        case ':to': {
           if (!split[1]) {
             throw 'unknown recipient';
           }
           let toName = split[1];
           let toMessage = split.slice(2).join(' ');
           player.whisper(toMessage, toName);
           //player.echo(message);
           break;
        }
        default: {
           throw 'unknown command type';
        }
      }
    } else {
      if (kwargs.defaultTo) {
        switch (kwargs.defaultTo) {
          case 'message': {
            player.message(message, kwargs.speaker);
            break;
          }
          case 'echo': { // XXX: echoed already... nec?
            player.echo(message);
            break;
          }
          case 'broadcast': {
            player.broadcast(message, kwargs.withName);
            break;
          }
          case 'whisper': {
            player.whisper(message, kwargs.toName);
            break;
          }
          default: {
            // do nothing
            break;
          }
        }
      } else {
        // do nothing
      }
    }
  }
  attemptToStart() {
    console.log(this.players.map(player => [player.name, player.state]));
    if (this.players.every((player) => player.state === PLAYER_STATES.READY)) {
      this.hasStarted = true;
      console.log('GAME STARTED!');
      // sort the players by id (for testing/deterministic reasons)
      // maybe by (lowercased) name might be better
      this.players = _.sortBy(this.players, (player) => player.id());
      _.forEach(this.players, (player) => {
        player.message('The game has begun!');
      });

      // configure the starting messages for each player...
      let startingResults = {};

      _.forEach(this.players, (player) => {
        startingResults[player.id()] = `${ player.name }, you are a ${ player.character.constructor.name }!`;
      });

      // give the players their basic details
      this.sendUpdatesToClients(startingResults);

      // start the game loop
      this.update();
    }
  }
}
