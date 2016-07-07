// a Map is made by an NxN grid of Cells
/* Things that extend Cell
  - Room
    - TreasureRoom (extends Room)
    - PassageRoom (extends Room)
  - Barrier/Wall (a solid rock that can be excavated into a room)
*/
export default class Cell {
  constructor(grid, row, col) {
    this.grid = grid;
    this.row = row;
    this.col = col;
  }
  get map() {
    return this.grid;
  }
  get x() {
    return this.col;
  }
  get y() {
    return this.row;
  }
  toJSON() {
    // should never be stringified
    return '?';
  }
}
