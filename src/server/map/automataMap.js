/* Taken from:
 * http://www.roguebasin.com/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
 * Try this too:
 * http://pixelenvy.ca/wa/ca_cave_demo.py.txt
 */
import _ from 'lodash';
import Rng from 'random-seed';
import F2DA from 'fixed-2d-array';

export const CELL_TYPES = {
  ROOM: '_',
  BARRIER: '#',
  TREASURE_ROOM: 'X',
  PASSAGE_ROOM: '^'
};

export default class CellularAutomataMapGenerator {
  constructor(seed = 1337, dimension = 16, percentWalls = 50) {
    this.seed = seed;
    this.rng  = new Rng(this.seed);
    this.dim  = dimension;
    this.percentWalls = percentWalls;
    // FIXME: might need to explicitly create each cell
    //this.map = [[]];
    this.map = new F2DA(this.dim, this.dim, CELL_TYPES.BARRIER);
    //console.log(this.map);
    console.log(this.toString());

    this.randomFillMap();
    //console.log(this.map);
    console.log(this.toString());

    this.makeCaverns();
    //console.log(this.map);
    console.log(this.toString());
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
    return this.map.get(y, x);
  }
  setCell(x, y, v) {
    this.map.set(y, x, v);
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
    let numWalls = this.adjacentWallCount(x, y, 1, 1);
    if (this.getCell(x, y) == CELL_TYPES.BARRIER) {
      if (numWalls >= 4) {
        return CELL_TYPES.BARRIER;
      } else if (numWalls < 2) {
        return CELL_TYPES.ROOM;
      }
    } else {
      if (numWalls >= 5) {
        return CELL_TYPES.BARRIER;
      }
    }

    return CELL_TYPES.ROOM;
  }
  randomFillMap() {
    console.log('in randomFillMap');
    let mapMiddle = this.dim / 2;

//    _.range(this.dim, (y) => {
//      _.range(this.dim, (x) => {
    for (let y = 0; y < this.dim; y++) {
      for(let x = 0; x < this.dim; x++) {
        console.log('y is ', y, ' || x is ', x);
        if (x === 0) {
          console.log('x is zero, adding wall');
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (y === 0) {
          console.log('y is zero, adding wall');
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (x === this.dim - 1) {
          console.log('x is maxo, adding wall');
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else if (y === this.dim - 1) {
          console.log('y is maxo, adding wall');
          this.setCell(x, y, CELL_TYPES.BARRIER);
        } else {
          if (y == mapMiddle) {
            this.setCell(x, y, CELL_TYPES.ROOM);
          } else {
            this.setCell(x, y, this.randomPercent(this.percentWalls));
          }
        }
      //});
    //});
      }
    }
  }
  randomPercent(perc) {
    if (perc >= this.rng.intBetween(1, 100)) {
      return CELL_TYPES.BARRIER;
    } else {
      return CELL_TYPES.ROOM;
    }
  }
  toString() {
    //console.log(this.map.length);
    //console.log(this.map[0].length);
    //console.log(this.map);
    //let cols = _.map(this.map, (col) => col.join(''));
    //return cols.join('\n');
    let str = '';

    /*
    _.range(this.dim, (rowInd) => {
      let rowStr = this.map.getRow(rowInd).join('');

      str += rowStr + '\n';
    });
    */

    for (let y = 0; y < this.dim; y++) {
      let rowStr = this.map.getRow(y).join('');

      str += (rowStr + '\n');
    }

    return str;
  }
}
