import * as GridParser from './parseGrid';
import * as Map from './map';
import { expect } from 'chai';
import { readFile } from 'fs';
import { GENERAL_LINE_SEPARATOR_REGEXP } from '../../helpers';
import { EOL } from 'os';

describe('Grid Parsing', function () {
  describe('TEST_PARSE_RESULT', function () {
    it('should have the correct dimensions', function () {
      expect(GridParser.TEST_PARSE_RESULT.height).to.equal(3);
      expect(GridParser.TEST_PARSE_RESULT.width).to.equal(4);
    });
    it('should have a correctly parsed grid', function(done) {
      readFile(GridParser.TEST_MAP_PATH, 'utf8', (error, data) => {
        expect(Boolean(error)).to.be.false;
        const gridPart = data.split(GENERAL_LINE_SEPARATOR_REGEXP).slice(1).join(EOL).trim();
        expect(Map.mapToString(GridParser.TEST_PARSE_RESULT)).to.equal(gridPart);
        done();
      });
    });
    it('should have the correct starting position', function () {
      expect(GridParser.TEST_PARSE_RESULT.startingPosition).to.eql({ row: 1, col: 1 });
    });
  });
  describe('validateGrid', function () {
    context('when there is no treasure room', () => {
      it('should return the proper message', () => {
        const grid: string[] = [
          '####',
          '#_^#',
          '####'
        ];

        const startingPosition = { row: 1, col: 2 };

        const doParse = () => GridParser.parseGrid(grid, startingPosition);

        expect(doParse).to.throw('no treasure room');
      });
    });
    context('when there is no starting position', () => {
      it('should provide the proper error message', () => {
        const grid = GridParser.TEST_PARSE_RESULT.grid;

        const sp1 = {
          row: NaN, col: NaN
        };

        expect(GridParser.validateGrid(grid, sp1)).to.include('starting position is malformed');
      });
    });
    context('when the starting position is off the grid', () => {
      it('it should provide the proper error message', () => {
        const grid = GridParser.TEST_PARSE_RESULT.grid;

        const sp2 = {
          row: 404, col: 0
        };

        expect(GridParser.validateGrid(grid, sp2)).to.include('starting position is invalid');
      });
    });
    context('when the provided starting position is not a passage room', () => {
      it('should provide the proper error message', () => {
        const grid = GridParser.TEST_PARSE_RESULT.grid;

        const startingPosition = {
          row: 2, col: 3
        };

        expect(GridParser.validateGrid(grid, startingPosition))
          .to.include('starting position must be a passage room');
      });
    });
  });
  describe('parseGrid', () => {
    it('should throw an error on invalid data', () => {
      const charGrid = [
        '#X#',
        '#^#',
        '###'
      ];

      const invalidSP = { row: 404, col: 9999 };

      expect(() => GridParser.parseGrid(charGrid, invalidSP)).to.throw(Error);
    });
  });
});
