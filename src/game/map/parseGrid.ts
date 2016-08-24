import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Map, isWithinMap } from './map';
import * as Cell from './cell';

interface PrimordialMap {
  startingPosition: Cell.Position;
  gridRows: string[];
};

export function gridRowsFromFile(fileName: string): PrimordialMap {
  const rawContents = readFileSync(fileName, 'utf8');
  const lines = rawContents.trim().split('\n');
  const firstLine = _.head(lines);
  const gridRows = _.tail(lines);

  const startingPosSplit = firstLine.split(' ');
  const row = parseInt(startingPosSplit[ 0 ], 10) - 1;
  const col = parseInt(startingPosSplit[ 1 ], 10) - 1;

  return {
    gridRows,
    startingPosition: { row, col }
  };
}

type ValidationResult = boolean | string;

export function validateGrid(grid: Cell.Cell[][], startingPosition: Cell.Position): ValidationResult {
  if (!_.some(_.flatten(grid), cell => Cell.isRoom(cell) && Cell.isTreasureRoom(cell))) {
    return 'There is no treasure room';
  }

  if (!_.isFinite(startingPosition.row) || !_.isFinite(startingPosition.col)) {
    return 'The starting position is malformed';
  }

  const srow = startingPosition.row;
  const scol = startingPosition.col;

  const withinGrid = 0 <= srow && srow < grid.length &&
    0 <= scol && scol < grid[ 0 ].length;

  if (!withinGrid) {
    return 'The starting position is invalid';
  }

  const startCell = grid[ startingPosition.row ][ startingPosition.col ];

  if (!(Cell.isRoom(startCell) && Cell.isPassageRoom(startCell))) {
    return 'The starting position must be a passage room';
  }

  return true;
}

export function parseGrid(gridRows: string[], startingPosition: Cell.Position): Map {
  const grid: Cell.Cell[][] = _.map(gridRows,
    (row, rowInd) => _.map(row,
      (col, colInd) => { //Cell.fromRepresentation(gridRows[ rowInd ][ colInd ])
        const cr = gridRows[ rowInd ][ colInd ];

        if (Cell.isCellRepresentation(cr)) {
          return Cell.fromRepresentation(cr as Cell.CellRepresentation, {
            row: rowInd, col: colInd
          }, {
              items: [],
              health: 50
            }
          );
        } else {
          throw new Error(`Unknown cell representation: "${cr}" at (${rowInd}, ${colInd})`);
        }
      }
    )
  );

  const validation = validateGrid(grid, startingPosition);
  if (validation !== true) {
    throw new Error(validation as string);
  }

  return {
    // the length of a row
    width: gridRows[ 0 ].length,
    // the number of rows
    height: gridRows.length,
    startingPosition,
    grid
  };
}

export const TEST_MAP_PATH = path.resolve(__dirname, '..', '..', '..', 'assets', 'server', 'testMap.txt');

export function testParse() {
  const testMapPath = TEST_MAP_PATH;
  const rows = gridRowsFromFile(testMapPath);
  return parseGrid(rows.gridRows, rows.startingPosition);
}

export const TEST_PARSE_RESULT = testParse();
