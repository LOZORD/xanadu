let _ = require('lodash');
let Cell = require('./cell');
let Character = require('./character/character');

class Room extends Cell {
  constructor(kwargs = {}) {
    super(kwargs);
    this.animals  = kwargs.animals  || [];
    this.items    = kwargs.items    || [];
    this.x = kwargs.x || -1;
    this.y = kwargs.y || -1;
  }
  entities() {
    return _.concat(this.animals, this.items);
  }
  characters() {
    return _.filter(this.animals, (animal) => animal instanceof Character);
  }
  // TODO: this is for describing the room via the `:look` command
  toString(observingCharacter) {
    let ret = ``;

    let otherCharacters = _(this.characters).without([observingCharacter]);
    let nonCharacters   = _.difference(this.animals(), this.characters());

    let otherCharactersArePresent = !_.isEmpty(otherCharacters);
    let nonCharactersArePresent   = !_.isEmpty(nonCharacters);

    if (!otherCharacters && !nonCharactersArePresent) {
      ret += `You are alone in a room`;
    }

    if (otherCharactersArePresent) {
      let otherNames = otherCharacters.map((character) => character.player.name);
      ret += `You are in a room with ${ otherNames.join(', ') }`;
    }

    if (otherCharactersArePresent && nonCharactersArePresent) {
      // TODO: provide more details
      ret += ` there are also non-humans present`;
    } else {
      ret += `You are in a room with non-humans`;
    }

    ret += '.';

    return ret;
  }
}

module.exports = Room;
