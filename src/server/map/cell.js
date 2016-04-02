// a Map is made by an NxN grid of Cells
/* Things that extend Cell
  - Room
  - TreasureRoom
  - EntranceRoom
  - Wall (a solid rock that can be excavated into a room)
*/
class Cell {
  constructor(kwargs = {}) {
    this.map  = kwargs.map;
    this.x    = kwargs.x || -1;
    this.y    = kwargs.y || -1;
  }
  neighbors() {
    const x = this.x;
    const y = this.y;
    let neighbors = {};

    // NW
    if (this.map.hasCell(x-1, y-1)) {
      neighbors.nw = this.map.getCell(x-1, y-1);
    }

    // N
    if (this.map.hasCell(x, y-1)) {
      neighbors.n = this.map.getCell(x, y-1);
    }

    // NE
    if (this.map.hasCell(x+1, y-1)) {
      neighbors.ne = this.map.getCell(x+1, y-1);
    }

    // W
    if (this.map.hasCell(x-1, y)) {
      neighbors.w = this.map.getCell(x-1, y);
    }

    // E
    if (this.map.hasCell(x+1, y)) {
      neighbors.e = this.map.getCell(x+1, y);
    }

    // SW
    if (this.map.hasCell(x-1, y+1)) {
      neighbors.sw = this.map.getCell(x-1, y+1);
    }

    // S
    if (this.map.hasCell(x, y+1)) {
      neighbors.s = this.map.getCell(x, y+1);
    }

    // SE
    if (this.map.hasCell(x+1, y+1)) {
      neighbors.se = this.map.getCell(x+1, y+1);
    }

    return neighbors;
  }
}

module.exports = Cell;
