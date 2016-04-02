let _ = require('lodash');
let Cell = require('./cell');

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
  players() {
    return _.filter(this.animals, (animal) => animal instanceof Character);
  }
}

module.exports = Room;
