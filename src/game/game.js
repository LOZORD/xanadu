import gen      from 'random-seed';
import _        from 'lodash';
import Emitter  from 'events';
import Player, { PLAYER_STATES } from './player';
import Map      from './map/map';
import ResponseFactory from '../server/responses/factory';

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
    return !this.hasStarted && this.players.length < this.maxPlayers;
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
    return this.getPlayer(socketId) !== undefined;
  }
  getPlayer(socketId) {
    return _.find(this.players, (player) => player.id === socketId);
  }
  addPlayer(socketId) {
    this.players.push(new Player({
      id: socketId,
      game: this
    }));
    const spotsLeft = this.maxPlayers - this.players.length;
    console.log('\taccepted socket');
    console.log(`\t${ spotsLeft } / ${ this.maxPlayers } spots left`);
    //socket.emit('request-name'); // might not be nec.
  }
  removePlayer(socketId) {
    return _.remove(this.players, (player) => player.id === socketId)[0];

    /*
    return _.chain(this.players)
            .remove(player => player.id === socket.id)
            .first()
            .value();
    */
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
  // TODO: decide if we are going to have "special" commands
  // (i.e. things that start with special characters like `:`)
  handleMessage(messageObj, socketId = null /*, kwargs = {}*/) {

    let responses = [];

    const senderId = socketId || messageObj.id;

    if (!senderId) {
      throw new Error('Unknown message sender!');
    }

    let sender = this.getPlayer(senderId);

    if (!sender) {
      throw new Error(`Could not find sender! Used id ${ senderId } for search.`);
    }

    const message = messageObj.msg;

    // always echo the message back to the player who sent it
    responses.push(new ResponseFactory.ECHO({
      withResponse: message,
      from: sender.id
    }));

    if (sender.state === PLAYER_STATES.ANON && !this.hasStarted) {
      if (this.validatePlayer(name)) {
        // TODO: welcome them to the game... etc
        // See lines 92-97 above
      } else {
        // TODO: reply with invalid name
      }
    } else if (sender.state === PLAYER_STATES.NAMED && !this.hasStarted) {
      if (message.toLowerCase() === 'ready') {
        sender.state = PLAYER_STATES.READY;
        // TODO: send player welcome message
        this.attemptToStart();
      } else {
        // globally heard messaging before game starts
        // TODO see `message` code
      }
    } else if (sender.state === PLAYER_STATES.PLAYING && this.hasStarted) {
      if (this.isTurnAction(message)) {
        // TODO: set their turn action... i.e.:
        //sender.setTurnAction(message);
      } else {
        // TODO: this is the case of something like `look` or `whisper`
        // it does not count as their turn action/move (i.e. it is "free")
      }
    } else {
      throw new Error(
        `Unknown message handling player state: ${ sender.state } and game 'hasStarted' state: ${ this.hasStarted }`
      );
    }

    //messageObj[sender]
    return responses;


    // a lot of the code for `message` will end up here
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
