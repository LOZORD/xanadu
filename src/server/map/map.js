let Cell    = require('./cell');
let Room    = require('./room');
let Barrier = require('./barrier');

class Map {
  constructor(kwargs = []) {
    this.seed = kwargs.seed;
    this.rng  = kwargs.rng;
    let d = this.dimension = kwargs.dimension;
    this.cells = [[]];

    _.range(d, (y) => {
      _.range(d, (x) => {
        this.cells[y][x] = new Room({
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
      0 <= i &&
      i <  d &&
      0 <= j &&
      j <  d
    );
  }
  getCell(x, y) {
    return this.cells[y][x];
  }
}

module.exports = Map;
