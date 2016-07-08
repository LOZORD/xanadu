import _ from 'lodash';
export default class Entity {
  // origin (0,0) is at NW corner of the map
  constructor(args = {}) {
    this.x = args.x || 0;
    this.y = args.y || 0;
  }
  setRowCol(row, col) {
    this.x = col;
    this.y = row;
  }
  setXY(x, y) {
    this.x = x;
    this.y = y;
  }
  get col() {
    return this.x;
  }
  set col(val) {
    this.x = val;
    return val;
  }
  get row() {
    return this.y;
  }
  set row(val) {
    this.y = val;
    return val;
  }
  get position() {
    return {
      x: this.x,
      y: this.y,
      row: this.row,
      col: this.col
    };
  }
}
