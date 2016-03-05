//let Invisible = require('invisible');
/*
 * player states [LINEAR]
 *    anon
 *    named
 *    ready
 *    playing (alive)
 *    dead
 *    spectating
 *    absent (player removed self from game)
 */

const PLAYER_STATES = {
  ANON: 0,
  NAMED: 1,
  READY: 2,
  PLAYING: 3,
  DEAD: 4,
  SPECTATING: 5,
  ABSENT: 6
};

class Player {
  constructor(args = {}) {
    this.socket = args.socket;
    this.game   = args.game;
    this.character = {}; // TODO
    this.state = PLAYER_STATES.ANON;
    this.name = args.name || '[NO NAME]';
    // add main listener
    this.socket.on('message', (message) => {
      console.log(message);
      this.game.message(this, message);
    });
  }

  id () {
    return this.socket.id;
  }

  // * -> player
  message (message, speaker = 'xanadu') {
    this.socket.emit('message', {
      speaker: speaker,
      message: message
    });
  }

  // player -> self
  echo (message) {
    this.socket.emit('message', {
      speaker: this.name,
      message: message
    });
  }

  // player -> all
  broadcast (message) {
    this.socket.broadcast('message', {
      speaker: this.name,
      message: message
    });
  }
}

Player.PLAYER_STATES = PLAYER_STATES;

module.exports = Player;
