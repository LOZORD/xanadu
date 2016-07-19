import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as path from 'path';

import { Map } from './map';
import { areSameCellType, CellType, fromRepr, Position, TreasureRoom } from './cell';

export function gridRowsFromFile(fileName: string): { startingPosition: Position, gridRows: string[] } {
  const rawContents = readFileSync(fileName, 'utf8');
  const lines = rawContents.trim().split('\n');
  const firstLine = _.head(lines);
  const gridRows = _.tail(lines);

  const startingPosSplit = firstLine.split(' ');
  const row = parseInt(startingPosSplit[0], 10) - 1;
  const col = parseInt(startingPosSplit[1], 10) - 1;

  return {
    gridRows,
    startingPosition: { row, col }
  };
}

type ValidationResult = boolean | string;

export function validateGrid(grid: CellType[][], startingPosition: Position): ValidationResult {
  if (!_.some(_.flatten(grid), cell => areSameCellType(cell, TreasureRoom))) {
    return 'There is no treasure room';
  }
  const startCell = grid[startingPosition.row][startingPosition.col];
  if (!startCell.room) {
    return 'The starting position is not a room';
  } else if (areSameCellType(startCell, TreasureRoom)) {
    return 'The starting position is the treasure room';
  }

  return true;
}

export function parseGrid(gridRows: string[], startingPosition: Position): Map {
  const grid = _.map(gridRows,
    (row, rowInd) => _.map(row,
      (col, colInd) => fromRepr(gridRows[rowInd][colInd])
    )
  );

  const validation = validateGrid(grid, startingPosition);
  if (validation !== true) throw new Error(validation as string);

  return {
    width: gridRows.length,
    height: gridRows[0].length,
    startingPosition,
    grid
  };
}

export function testParse() {
  const testMapPath =
    path.resolve(__dirname, '..', '..', '..', 'assets', 'testMap.txt');
  const rows = gridRowsFromFile(testMapPath);
  return parseGrid(rows.gridRows, rows.startingPosition);
}

export const TEST_PARSE_RESULT = testParse();