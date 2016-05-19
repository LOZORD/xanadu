import gen      from 'random-seed';
import _        from 'lodash';
import Emitter  from 'events';
import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';

const WITHOUT_NAME = false;

// TODO: one of the game parameters should be the number of modifiers randomly assigned
export default class Game extends Emitter {
  constructor(args = {}) {
    super(args);
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
  hasPlayer(socketId) {
    return _.chain(this.players)
            .map(player => player.id)
            .findIndex(socketId)
            .gte(0)
            .value();
  }
  addPlayer(socket) {
    this.players.push(new Player({
      id: socket.id,
      game: this
    }));
    const spotsLeft = this.maxPlayers - this.players.length;
    console.log('\taccepted socket');
    console.log(`\t${ spotsLeft } / ${ this.maxPlayers } spots left`);
    //socket.emit('request-name'); // might not be nec.
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
  // FIXME: needs to be vastly rewritten
  handleMessage(/*messageObj, player, kwargs = {}*/) {
    throw new Error('REIMPLEMENT ME!');
    /*
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
             throw new Error('unknown recipient');
           }
           let toName = split[1];
           let toMessage = split.slice(2).join(' ');
           player.whisper(toMessage, toName);
           //player.echo(message);
           break;
        }
        default: {
           throw new Error('unknown command type');
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
    */
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
