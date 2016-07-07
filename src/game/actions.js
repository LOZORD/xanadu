import Animal from './animal';

export default class Action {
  constructor(actor, timestamp, text) {
    if (!(actor instanceof Animal)) {
      throw new Error(`${ actor.constructor.toString() } is not an Animal!`);
    }

    this.actor = actor;
    this.timestamp = timestamp;
    this.text = text;
  }
}


export class MoveAction extends Action {
  constructor(actor, timestamp, text, direction, distance = 1) {
    super(actor, timestamp, text);
    this.direction  = direction;
    this.distance   = distance;
  }
}
