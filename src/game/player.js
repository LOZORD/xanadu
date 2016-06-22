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
  constructor(args = {}) {
    this.id = args.id;
    if (!this.id) {
      throw new Error('Need id for player construction!');
    }

    // TODO: make this a non-generic Character class using the Character Factory
    this.character = new Character({
      player: this,
      x: args.x || 0,
      y: args.y || 0
    }); // TODO
    this.state = PLAYER_STATES.ANON;
    // XXX this could be buggy (i.e. ANON && "has" name)
    this.name = args.name || '[NO NAME]';
  }

  isAnon() {
    return this.state === PLAYER_STATES.ANON;
  }

  isAnonymous() {
    return this.isAnon();
  }

  isNamed() {
    return this.state === PLAYER_STATES.NAMED;
  }

  isReady() {
    return this.state === PLAYER_STATES.READY;
  }

  isPlaying() {
    return this.state === PLAYER_STATES.PLAYING;
  }

  isDead() {
    return this.state === PLAYER_STATES.DEAD;
  }

  isSpectating() {
    return this.state === PLAYER_STATES.SPECTATING;
  }

  isAbsent() {
    return this.state === PLAYER_STATES.ABSENT;
  }

  // creates an object summarizing the state of the player
  getDetails() {
    // TODO: offload this gathering code onto Character class

    // get all the active modifiers
    // TODO: eventually we want to give numbers (e.g. "4/8 players killed")
    let modifiers = _.chain(this.character.modifiers)
                      .pickBy( _.identity)
                      .keys()
                      .value();

    // TODO: send the (player's concept) of the map as well
    return {
      name: this.name,
      class: this.character.characterClass,
      inventory: this.character.inventory,
      modifiers: modifiers,
      stats: {
        health: this.character.health,
        strength: this.character.strength,
        intelligence: this.character.intelligence,
        agility: this.character.agility
      }
    };
  }
}
