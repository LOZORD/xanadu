import Animal from './animal';

export default class Action {
  constructor(actor, timestamp, text) {
    if (!(actor instanceof Animal)) {
      throw new Error(`${ actor.constructor.name } is not an Animal!`);
    }

    this.actor = actor;
    this.timestamp = timestamp;
    this.text = text;
  }
}


export class MoveAction extends Action {
  constructor(actor, timestamp, text, direction, distance = 1) {
    super(actor, timestamp, text);
    this.direction = direction;
    this.distance = distance;
  }
  newPosition() {
    const {row, col } = this.actor.position;

    switch (this.direction) {
      case 'north': {
        return {
          row: row - 1,
          col
        };
      }
      case 'south': {
        return {
          row: row + 1,
          col
        };
      }
      case 'west': {
        return {
          row,
          col: col - 1
        };
      }
      case 'east': {
        return {
          row,
          col: col + 1
        };
      }
      default: {
        return null;
      }
    }
  }
}
