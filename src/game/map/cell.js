// a Map is made by an NxN grid of Cells
/* Things that extend Cell
  - Room
    - TreasureRoom (extends Room)
    - PassageRoom (extends Room)
  - Barrier/Wall (a solid rock that can be excavated into a room)
*/
export default class Cell {
  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
  }
  get grid() {
    return this.map;
  }
  toJSON() {
    // should never be stringified
    return '?';
  }
}
