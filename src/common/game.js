let gen = require('random-seed');
let Emitter = require('events');
let Player  = require('../common/player');
class Game extends Emitter {
  constructor(args = {}) {
    super(args);
    this.players = args.players || [];
    this.map = this.generateMap();
    this.setupMap(this.socketRoom, this.map);
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
  }
  update() {
    // the main update ("tick") logic will go here
  }
  setupMap(socketRoom, map) {
    //TODO
    // for now, do nothing
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
