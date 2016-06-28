export default class Action {
  constructor(timestamp, text) {
    this.timestamp = timestamp;
    this.text = text;
  }
}


export class MoveAction extends Action {
  constructor(timestamp, text, character, direction, distance = 1) {
    super(timestamp, text);
  }
}
