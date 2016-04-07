/* Taken from:
 * http://www.roguebasin.com/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
 */
let _   = require('lodash');
let Rng = require('random-seed');

const CELL_TYPES = {
  ROOM: '_',
  BARRIER: '#',
  TREASURE_ROOM: 'X',
  PASSAGE_ROOM: '^'
};

class CellularAutomataMapGenerator {
  constructor(seed, dimension, percentWalls) {
    this.seed = seed;
    this.rng  = new Rng(this.seed);
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
    let numWalls = adjacentWallCount(x, y, 1, 1);
    if (this.getCell(x, y) == CELL_TYPES.BARRIER) {
      if (numWalls >= 4) {
        return CELL_TYPES.BARRIER;
      } else if (numWalls < 2) {
        return CELL_TYPES.ROOM;
      }
    } else {
      if (numWalls > = 5 {
        return CELL_TYPES.BARRIER;
      }
    }

    return CELL_TYPES.ROOM;
  }
  randomFillMap() {
    //let newMap = [[]];

    let mapMiddle = this.dim / 2;

    _.range(this.dim, (y) => {
      _.range(this.dim, (x) => {
        if (x === 0) {
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (y === 0) {
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (x === this.dim - 1) {
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (y === this.dim - 1) {
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else {
          if (row == mapMiddle) {
            this.setCell(x, y, CELL_TYPES.ROOM);
          } else {
            this.setCell(x, y, this.randomPercent(this.percentWalls);
          }
        }
      });
    });
  }
  randomPercent(perc) {
    if (perc >= this.rng.intBetween(1, 100)) {
      return CELL_TYPES.BARRIER;
    } else {
      return CELL_TYPES.ROOM;
    }
  }
  toString() {
    let cols = _.map(this.map, (col) => col.join(''));
    return cols.join('\n');
  }
}

module.exports = CellularAutomataMapGenerator;
