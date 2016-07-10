import _ from 'lodash';
export default class Entity {
  // (0,0) is the NW corner of the grid
  constructor(row = 0, col = 0) {
    this.row = row;
    this.col = col;
  }
  setPosition(row, col) {
    this.row = row;
    this.col = col;
  }
  get position() {
    return {
      row: this.row,
      col: this.col
    };
  }
}
