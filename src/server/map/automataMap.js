/* Taken from:
 * http://www.roguebasin.com/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
 */
let _   = require('lodash');
// let Rng = require('random-seed');

const CELL_TYPES = {
  ROOM: '_',
  BARRIER: '#',
  TREASURE_ROOM: 'X',
  PASSAGE_ROOM: '^'
};

class CellularAutomataMapGenerator {
  constructor(seed, dimension, percentWalls) {
    this.seed = seed;
    this.dim  = dimension;
    this.percentWalls = percentWalls;
    this.map = [[]];

    this.randomFillMap();
  }
  hasCell(x, y) {
    return (
        0 <= x &&
        x <  this.dim &&
        0 <= y &&
        y <   this.dim
    );
  }
  getCell(x, y) {
    return this.map[y][x];
  }
  setCell(x, y, v) {
    this.map[y][x] = v;
  }
  adjacentWallCount(centerX, centerY, spanX, spanY) {
    let numWalls = 0;
    _.range(centerY - spanY, centerY + spanY, (y) => {
      _.range(centerX - spanX, centerX + spanX, (x) => {
        if (!(x === centerX && y === centerY)) {
          if (this.hasCell(x, y) && this.getCell(x, y) === CELL_TYPES.BARRIER) {
            numWalls++;
          } else if (!this.hasCell(x, y)) {
            // consider out-of-bound a wall
            numWalls++;
          }
        }
      });
    });

    return numWalls;
  }
  makeCaverns() {
    _.range(this.dim, (y) => {
      _.range(this.dim, (x) => {
        let newCell = this.placeWallLogic(x, y);
        this.setCell(x, y, newCell);
      });
    });
  }
  placeWallLogic(x, y) {
    // TODO
    return [null, x, y];
  }
  randomFillMap() {
    // TODO
    return null;
  }
  randomPercent(perc) {
    return [null, perc];
  }
  toString() {
    let cols = _.map(this.map, (col) => col.join(''));
    return cols.join('\n');
  }
}

module.exports = CellularAutomataMapGenerator;
