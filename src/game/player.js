import _ from 'lodash';
import Character from './character/character';

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

export const PLAYER_STATES = {
  ANON: 0,
  NAMED: 1,
  READY: 2,
  PLAYING: 3,
  DEAD: 4,
  SPECTATING: 5,
  ABSENT: 6
};

export default class Player {
  constructor(id, name) {
    this.id = id;

    if (!name) {
      this.name = '[NO NAME]';
      this.state = PLAYER_STATES.ANON;
    } else {
      this.name = name;
      this.state = PLAYER_STATES.NAMED;
    }

    // TODO: Pass on modifiers &etc
    this.character = new Character();
  }

  isAnon = () => this.state === PLAYER_STATES.ANON;

  isNamed = () => this.state === PLAYER_STATES.NAMED;

  isPlaying = () => this.state === PLAYER_STATES.PLAYING;

  isDead = () => {
    // check for inconsistency bugs
    if ((this.state === PLAYER_STATES.DEAD) !== (this.isAlive() === false)) {
      console.log('INCONSISTENT DEATH STATE!!!');
    }

    return this.state === PLAYER_STATES.DEAD;
  };

  isSpectating = () => this.state === PLAYER_STATES.SPECTATING;

  isAbsent = () => this.state === PLAYER_STATES.ABSENT;

  // print debug info
  debugString () {
    let debugObj = {
      'Name':   this.name,
      'State':  this.state,
      'X Pos':  this.character.x,
      'Y Pos':  this.character.y
    };

    return _
      .chain(debugObj)
      .toPairs()
      .map(([key, val]) => key + ' : ' + val)
      .join('\n')
      .value();
  }
}
