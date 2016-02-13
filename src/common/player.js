//let Invisible = require('invisible');

class Player {
  constructor(args = {}) {
    this.socket = args.socket;
    this.game   = args.game;
    this.character = {}; // TODO
  }

  id () {
    return this.socket.id;
  }
}

//module.exports = Invisible.createModel('Player', Player);

module.exports = Player;
