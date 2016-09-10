// NOTE: currently NOT used, see issue #50

import { Position } from './cell';

export interface Grid<T> {
  cells: T[][];
};

export function height(grid: Grid<any>): number {
  return grid.cells.length;
}

export function width(grid: Grid<any>): number {
  return grid.cells[0].length;
}

export function isWithinGrid(grid: Grid<any>, { row, col }: Position): boolean {
  return 0 <= row &&
    row < height(grid) &&
    0 <= col &&
    col < width(grid);
}

export function getCell<T>(grid: Grid<T>, { row, col }: Position): T {
  return grid.cells[row][col];
}

export function arraysToGrid<T>(arrays: T[][]): Grid<T> {
  return {
    cells: arrays
  };
}

export function mapGrid<T, U>(grid: Grid<T>, func: (cell: T, pos: Position) => U): Grid<U> {
  const newCells = grid.cells.map((row, rowInd) => {
    return row.map((cell, colInd) => {
      return func(cell, { row: rowInd, col: colInd });
    });
  });

  return arraysToGrid(newCells);
}
