import { expect } from 'chai';
import * as Map from './map';
import * as CharacterMap from './characterMap';
import * as _ from 'lodash';
import { TEST_PARSE_RESULT } from './parseGrid';
import * as Cell from './cell';

describe('Character Map', function () {
  describe('createCharacterMap', function () {
    before(function () {
      this.gameMap = _.cloneDeep(TEST_PARSE_RESULT);
      this.characterMap = CharacterMap.createCharacterMap(this.gameMap);
    });

    it('should start with every cell hidden', function () {
      const flattenedGrid = _.flatten((this.characterMap as CharacterMap.CharacterMap).grid);

      const allUnknown = _.every(flattenedGrid, (cell) => cell.representation === '?');

      expect(allUnknown).to.be.true;
    });
  });

  describe('reveal', function () {
    before(function () {
      this.gameMap = _.cloneDeep(TEST_PARSE_RESULT);
      this.characterMap = CharacterMap.createCharacterMap(this.gameMap);
    });
    it('should update the center cell and its cardinal neighbors', function () {
      CharacterMap.reveal(this.characterMap, TEST_PARSE_RESULT.startingPosition);

      const neighbors = _.values<Cell.Position>(
        Cell.getCardinalNeighboringPositions(TEST_PARSE_RESULT.startingPosition)
      );

      const validPositions = neighbors.concat(TEST_PARSE_RESULT.startingPosition).filter(pos => {
        return Map.isWithinMap(this.gameMap, pos);
      });

      validPositions.forEach(pos => {
        const isRevealed =
          Map.getCell(this.characterMap, pos).representation === Map.getCell(this.gameMap, pos).representation;

        expect(isRevealed).to.be.true;
      });
    });
    it('should be a shallow view of the game map', function () {
      const { south } = Cell.getCardinalNeighboringPositions(this.gameMap.startingPosition);

      // check before we replace
      expect(Cell.isRoom(Map.getCell(this.gameMap, south))).to.be.true;

      // make it a barrier
      this.gameMap.grid[ south.row ][ south.col ] = {
        representation: '#',
        row: south.row,
        col: south.col
      };

      expect(Cell.isBarrier(Map.getCell(this.gameMap, south))).to.be.true;

      expect(Cell.isBarrier(Map.getCell(this.characterMap, south))).to.be.false;

      CharacterMap.reveal(this.characterMap, this.characterMap.startingPosition);

      expect(Cell.isBarrier(Map.getCell(this.characterMap, south))).to.be.true;
    });
  });
});
