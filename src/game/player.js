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
    // TODO: might not want to make this UNTIL we know that the current context is a game
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

  canCommunicateWithPlayer(otherPlayer) {
    // two players can always talk if neither of them are playing

    // if both are playing,
    // then they must either be of the same alliance,
    // or one must have the proper translation skill
    // or one must have the translation book in their inventory

    // if only one is playing, they cannot communicate

    if (this.isPlaying() === otherPlayer.isPlaying()) {
      if (this.isPlaying()) {
        if (this.character.alliance === otherPlayer.character.alliance) {
          return true;
        } else if (this.character.canTranslateModern()
            || otherPlayer.character.canTranslateModern()) {
          return true;
        } else if (this.character.inventory.hasItem('ModernTranslationBook')
            || otherPlayer.character.inventory.hasItem('ModernTranslationBook')) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  // for the RHS pane in the client UI
  getDetails() {
    return _.merge({ name: this.name, state: this.state },
        this.character.getDetails());
  }

  // creates an object summarizing the state of the player
  getDebugDetails() {
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
      state: this.state,
      class: this.character.characterClass,
      inventory: this.character.inventory,
      modifiers: modifiers,
      position: {
        row: this.character.position.row,
        col: this.character.position.col
      },
      stats: {
        health: this.character.health,
        strength: this.character.strength,
        intelligence: this.character.intelligence,
        agility: this.character.agility
      },
      action: {
        text: this.character.nextAction ? this.character.nextAction.text : '',
        timestamp: this.character.nextAction ? this.character.nextAction.timestamp : ''
      }
    };
  }
}
