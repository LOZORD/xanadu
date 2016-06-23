// a Map is made by an NxN grid of Cells
/* Things that extend Cell
  - Room
    - TreasureRoom (extends Room)
    - PassageRoom (extends Room)
  - Wall (a solid rock that can be excavated into a room)
*/
export default class Cell {
  constructor(kwargs = {}) {
    this.map  = kwargs.map;
    this.x    = kwargs.x || -1;
    this.y    = kwargs.y || -1;
  }
  neighbors() {
    const x = this.x;
    const y = this.y;
    let myNeighbors = {};

    // NW
    if (this.map.hasCell(x-1, y-1)) {
      myNeighbors.nw = this.map.getCell(x-1, y-1);
    }

    // N
    if (this.map.hasCell(x, y-1)) {
      myNeighbors.n = this.map.getCell(x, y-1);
    }

    // NE
    if (this.map.hasCell(x+1, y-1)) {
      myNeighbors.ne = this.map.getCell(x+1, y-1);
    }

    // W
    if (this.map.hasCell(x-1, y)) {
      myNeighbors.w = this.map.getCell(x-1, y);
    }

    // E
    if (this.map.hasCell(x+1, y)) {
      myNeighbors.e = this.map.getCell(x+1, y);
    }

    // SW
    if (this.map.hasCell(x-1, y+1)) {
      myNeighbors.sw = this.map.getCell(x-1, y+1);
    }

    // S
    if (this.map.hasCell(x, y+1)) {
      myNeighbors.s = this.map.getCell(x, y+1);
    }

    // SE
    if (this.map.hasCell(x+1, y+1)) {
      myNeighbors.se = this.map.getCell(x+1, y+1);
    }

    return myNeighbors;
  }
}
