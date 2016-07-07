import _ from 'lodash';
import { TEST_GRID_PARSE } from './parseGrid';

export class BaseMap {
  constructor(characterGrid, startingPosition) {
    const { grid, treasureRoom, startingPassageRoom }
      = TEST_GRID_PARSE;

    this.grid = grid;
    this.treasureRoom = treasureRoom;
    this.startingPassageRoom = startingPassageRoom;
  }
  get height() {
    return this.grid.getHeight();
  }
  get width() {
    return this.grid.getWidth();
  }
  withinBounds(row, col) {
    return (
        0 <= row &&
        row < this.height &&
        0 <= col &&
        col < this.width
    );
  }
  toJSON() {
    let res = [];

    for (let row = 0; row < this.height; row++) {
      const rowData = this.grid.getRow(row);
      res.push(_.map(rowData, (cell) => cell.toJSON()).join(''));
    }

    return res;
  }
}

export default class GameMap extends BaseMap {
  constructor(characterGrid, startingPosition, rng) {
    super(characterGrid, startingPosition);
    this.rng = rng;
  }
}

export class CharacterMap extends BaseMap {
  constructor(characterGrid, startingPosition, gameMap) {
    super(characterGrid, startingPosition);
    this.gameMap = gameMap;
  }
}
