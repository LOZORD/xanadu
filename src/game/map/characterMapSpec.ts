import { expect } from 'chai';
import * as Map from './map';
import * as CharacterMap from './characterMap';
import * as _ from 'lodash';
import { TEST_PARSE_RESULT } from './parseGrid';
import * as Cell from './cell';

describe('Character Map', function () {
  describe('createCharacterMap', function () {
    let gameMap: Map.Map;
    let characterMap: CharacterMap.CharacterMap;
    before(function () {
      gameMap = _.cloneDeep(TEST_PARSE_RESULT);
      characterMap = CharacterMap.createCharacterMap(gameMap);
    });

    it('should start with every cell hidden', function () {
      const flattenedGrid = _.flatten(characterMap.grid);

      const allUnknown = _.every(flattenedGrid, (cell) => cell.representation === '?');

      expect(allUnknown).to.be.true;
    });
  });

  describe('reveal', function () {
    let gameMap: Map.Map;
    let characterMap: CharacterMap.CharacterMap;
    before(function () {
      gameMap = _.cloneDeep(TEST_PARSE_RESULT);
      characterMap = CharacterMap.createCharacterMap(gameMap);
    });
    it('should update the center cell and its cardinal neighbors', function () {
      CharacterMap.reveal(characterMap, TEST_PARSE_RESULT.startingPosition);

      const neighbors = _.values<Cell.Position>(
        Cell.getCardinalNeighboringPositions(TEST_PARSE_RESULT.startingPosition)
      );

      const validPositions = neighbors.concat(TEST_PARSE_RESULT.startingPosition).filter(pos => {
        return Map.isWithinMap(gameMap, pos);
      });

      validPositions.forEach(pos => {
        const isRevealed =
          Map.getCell(characterMap, pos).representation === Map.getCell(gameMap, pos).representation;

        expect(isRevealed).to.be.true;
      });
    });
    it('should be a shallow view of the game map', function () {
      const { south } = Cell.getCardinalNeighboringPositions(gameMap.startingPosition);

      // check before we replace
      expect(Cell.isRoom(Map.getCell(gameMap, south))).to.be.true;

      // make it a barrier
      gameMap.grid[ south.row ][ south.col ] = {
        representation: '#',
        row: south.row,
        col: south.col
      };

      expect(Cell.isBarrier(Map.getCell(gameMap, south))).to.be.true;

      expect(Cell.isBarrier(Map.getCell(characterMap, south))).to.be.false;

      CharacterMap.reveal(characterMap, characterMap.startingPosition);

      expect(Cell.isBarrier(Map.getCell(characterMap, south))).to.be.true;
    });
  });
});
