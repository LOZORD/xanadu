export default class Action {
  constructor(player, timestamp, text) {
    this.player = player;
    this.timestamp = timestamp;
    this.text = text;
  }
}


export class MoveAction extends Action {
  constructor(player, timestamp, text, character, direction, distance = 1) {
    super(player, timestamp, text);
  }
}
