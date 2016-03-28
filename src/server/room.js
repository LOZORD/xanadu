class Room {
  // TODO: what about "blocked" rooms (i.e. rocks?)
  constructor(kwargs = {}) {
    this.animals  = kwargs.animals  || [];
    this.items    = kwargs.items    || [];
    this.isTreasureRoom = kwargs.isTreasureRoom || false;
    this.isEntrance = kwargs.isEntrance || false;
    this.x = kwargs.x || -1;
    this.y = kwargs.y || -1;
  }
  entities() {
    return _.concat(this.animals, this.items);
  }
  players() {
    return _.filter(this.animals, (animal) => animal instanceof Character);
  }
}

module.exports = Room;
