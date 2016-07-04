import _ from 'lodash';
import { TEST_GRID_PARSE } from './parseGrid';

export class BaseMap {
  constructor(characterGrid, startingPosition) {
    const { grid, treasureRoom, startingPassageRoom }
      = TEST_GRID_PARSE;

    this.grid = grid;
    this.width = this.grid.getWidth();
    this.height = this.grid.getHeight();
    this.treasureRoom = treasureRoom;
    this.startingPassageRoom = startingPassageRoom;
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

    for (let y = 0; y < this.height; y++) {
      let row = [];
      for (let x = 0; x < this.width; x++) {
        let someCell = this.grid.get(x, y);
        //res.push(someCell.toJSON())
        row.push(someCell.toJSON());
      }
      res.push(row.join(''));
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
