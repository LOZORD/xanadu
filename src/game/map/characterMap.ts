import * as _ from 'lodash';
import * as Map from '../map/map';
import * as Cell from '../map/cell';

export type Names = 'Map';

export interface CharacterMap extends Map.Map {
  gameMap: Map.Map;
}

export function createCharacterMap(gameMap: Map.Map): CharacterMap {
  const characterMapGrid: Cell.Cell[][] = gameMap.grid.map((row) => row.map(cell => {
    return { row: cell.row, col: cell.col, representation: '?' } as Cell.Cell;
  }));

  return {
    gameMap,
    grid: characterMapGrid,
    width: gameMap.width,
    height: gameMap.height,
    startingPosition: gameMap.startingPosition
  };
}

export function reveal(characterMap: CharacterMap, centerPos: Cell.Position): CharacterMap {
  const cardinalNeighbors = Cell.getCardinalNeighboringPositions(centerPos);

  const neighborPositions = _.values(cardinalNeighbors) as Cell.Position[];

  const inMapNeighbors = _.filter(neighborPositions,
    pos => Map.isWithinMap(characterMap.gameMap, pos));

  // remember to include the cell we're currently in!
  inMapNeighbors.concat(centerPos).forEach(pos => {
    const actualCell = Map.getCell(characterMap.gameMap, pos);

    characterMap.grid[ pos.row ][ pos.col ] = _.clone(actualCell);
  });

  return characterMap;
}
