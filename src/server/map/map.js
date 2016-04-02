let _ = require('lodash');
let Cell    = require('./cell');
//let Room    = require('./room');
//let Barrier = require('./barrier');
// TODO treasure room and entrace/exit rooms

class Map {
  constructor(kwargs = []) {
    this.seed = kwargs.seed;
    this.rng  = kwargs.rng;
    let d = this.dimension = kwargs.dimension;
    this.cells = [[]];

    _.range(d, (y) => {
      _.range(d, (x) => {
        this.cells[y][x] = new Cell({
          x: x,
          y: y,
          map: this
        });
      })
    });

    // TODO: random generation
    this.treasureRoom = null;
  }
  hasCell(x, y) {
    let d = this.dimension;
    return (
      0 <= x &&
      x <  d &&
      0 <= y &&
      y <  d
    );
  }
  getCell(x, y) {
    return this.cells[y][x];
  }
}

module.exports = Map;
