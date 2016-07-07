import _ from 'lodash';
import fs from 'fs';
import path from 'path';
//import F2DA from 'fixed-2d-array';
import Grid from './grid';

import Room         from './room';
import TreasureRoom from './treasureRoom';
import PassageRoom  from './passageRoom';
import Barrier      from './barrier';

export const CELL_CONSTRUCTORS = {
  '_': Room,
  '#': Barrier,
  'X': TreasureRoom,
  '^': PassageRoom
};

export const getMapFileContents = (fileName) => {
  const rawContents = fs.readFileSync(fileName, 'utf8');
  const lines = rawContents.trim().split('\n');
  const firstLine = _.head(lines);
  const characterGrid = _.tail(lines);

  const startingPosSplit = firstLine.split(' ');
  const row = parseInt(startingPosSplit[0], 10) - 1;
  const col = parseInt(startingPosSplit[1], 10) - 1;

  return {
    characterGrid,
    startingPosition: { row, col }
  };
};

const parseGrid = (characterGrid, startingPosition = null) => {
  // characterGrid is a list of rows
  const numRows = characterGrid.length;
  const numCols = characterGrid[0].length;

  const grid = new Grid(numRows, numCols);

  let treasureRoom = null;
  let startingPassageRoom = null;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const cellType = characterGrid[row][col];

      const cellConstructor = CELL_CONSTRUCTORS[cellType];

      if (!cellConstructor) {
        throw new Error(`Unknown cell constructor type: ${ cellType }`);
      }


      grid.set(row, col, (new (cellConstructor)(grid, row, col)));

      if (!startingPassageRoom) {
        let startInThisCell = false;

        if (startingPosition) {
          startInThisCell = (
              row === startingPosition.row &&
              col === startingPosition.col
          );
        } else if (cellConstructor === PassageRoom) {
          startInThisCell = true;
        }

        if (startInThisCell) {
          startingPassageRoom = grid.get(row, col);
        }
      }

      if (!treasureRoom && cellConstructor === TreasureRoom) {
        treasureRoom = grid.get(row, col);
      }
    }
  }

  return {
    grid,
    treasureRoom,
    startingPassageRoom,
    map: grid
  };
};

export default parseGrid;

export const TEST_FILE = path.join(__dirname, 'testMap.txt');

export const TEST_MAP_DATA = getMapFileContents(TEST_FILE);

export const TEST_GRID_PARSE = parseGrid(
    TEST_MAP_DATA.characterGrid,
    TEST_MAP_DATA.startingPosition
);
