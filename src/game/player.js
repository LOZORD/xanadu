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
    //this.socket = args.socket;
    //socket stuff now handled by server
    this.id = args.id;
    if (!this.id) {
      throw new Error('Need id for player construction!');
    }
    this.game   = args.game;

    // TODO: get this 'startLoc' for the map itself
    // this is the room that everyone spawns in
    let startLoc = this.game.map.dimension / 2;

    // TODO: make this a non-generic Character class using the Character Factory
    this.character = new Character({
      player: this,
      x: startLoc,
      y: startLoc
    }); // TODO
    this.state = PLAYER_STATES.ANON;
    // XXX this could be buggy (i.e. ANON && "has" name)
    this.name = args.name || '[NO NAME]';
    // add main listener -- this is now handled by the server!
    /*
    this.socket.on('message', (messageObj) => {
      console.log(messageObj);
      this.game.message(this, messageObj);
    });
    */
  }

  isAnon() {
    return this.state === PLAYER_STATES.ANON;
  }

  isNamed() {
    return this.state === PLAYER_STATES.NAMED;
  }

  isPlaying() {
    return this.state === PLAYER_STATES.PLAYING;
  }

  isDead() {
    // check for inconsistency bugs
    if ((this.state === PLAYER_STATES.DEAD) !== (this.isAlive() === false)) {
      console.log('INCONSISTENT DEATH STATE!!!');
    }

    return this.state === PLAYER_STATES.DEAD;
  }

  isSpectating() {
    return this.state === PLAYER_STATES.SPECTATING;
  }

  isAbsent() {
    return this.state === PLAYER_STATES.ABSENT;
  }

  id () {
    return this.socket.id;
  }

  // * -> player
  message (message, speaker = 'xanadu') {
    this.socket.emit('message', {
      speaker: speaker,
      message: message,
      type: 'message'
    });
  }

  // player -> self
  echo (message) {
    this.socket.emit('message', {
      speaker: this.name,
      message: message,
      type: 'echo'
    });
  }

  // player -> all
  broadcast (message, withName = true) {
    this.socket.broadcast.emit('message', {
      speaker: withName ? this.name : '',
      message: message,
      type: 'broadcast'
    });
  }

  // player -> player
  // XXX: is this unnec. b/c of .message func?
  whisper (message, toName) {
    toName = toName.toLowerCase();
    let toPlayer = _.find(this.game.players,
        (player) => player.name.toLowerCase() === toName);
    toPlayer.socket.emit('message', {
      speaker: this.name,
      message: message,
      type: 'whisper'
    });
  }

  // game update -> player (RHS details)
  updateDetails() {
    // TODO: offload this gathering code onto Character class

    // get all the active modifiers
    // TODO: eventually we want to give numbers (e.g. "4/8 players killed")
    let modifiers = _.chain(this.character.modifiers)
                      .pickBy( _.identity)
                      .keys()
                      .value();

    // TODO: send the (player's concept) of the map as well
    this.socket.emit('details', {
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
    });
  }

  // TODO: send message that will display in LHS pane
  messageUpdates(resultMessage) {
    console.log(`TODO: send ${ resultMessage || '[resultMessage]' } to ${ this.name + ' ' + this.id() }`);
  }

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
