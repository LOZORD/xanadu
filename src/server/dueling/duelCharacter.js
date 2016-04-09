/* 
Possibly extends or copies data from overworld player.
Holds duel-specific information on the players which is copied back after duel is ended.
*/

let Character = require('../character/character');

class DuelCharacter extends Character {
  constructor(args = {}) {
    super(args);
    this.duelTurn = false;
    this.duelPosition = -1;
  }

  duelReset() {
    this.duelTurn = false;
    this.duelPosition = -1;
  }
}

module.exports = DuelCharacter;
