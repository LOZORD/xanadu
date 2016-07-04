import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import F2DA from 'fixed-2d-array';

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
  const mapHeight = characterGrid.length;
  const mapWidth  = characterGrid[0].length;

  const map = new F2DA(mapWidth, mapHeight, null);

  let treasureRoom = null;
  let startingPassageRoom = null;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const cellType = characterGrid[y][x];

      const cellConstructor = CELL_CONSTRUCTORS[cellType];

      if (!cellConstructor) {
        throw new Error(`Unknown cell constructor type: ${ cellType }`);
      }

      map.set(x, y, (new (cellConstructor)(map, x, y)));

      if (!startingPassageRoom) {
        let startInThisCell = false;

        if (startingPosition) {
          startInThisCell = (
              y === startingPosition.row &&
              x === startingPosition.col
          );
        } else if (cellConstructor === PassageRoom) {
          startInThisCell = true;
        }

        if (startInThisCell) {
          startingPassageRoom = map.get(x, y);
        }
      }

      if (!treasureRoom && cellConstructor === TreasureRoom) {
        treasureRoom = map.get(x, y);
      }
    }
  }

  return {
    map,
    treasureRoom,
    startingPassageRoom,
    grid: map
  };
};

export default parseGrid;

export const TEST_FILE = path.join(__dirname, 'testMap.txt');

export const TEST_MAP_DATA = getMapFileContents(TEST_FILE);

export const TEST_GRID_PARSE = parseGrid(
    TEST_MAP_DATA.characterGrid,
    TEST_MAP_DATA.startingPosition
);
