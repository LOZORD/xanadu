import { expect } from 'chai';
import * as Cell from './cell';

describe('Cell', function () {
  describe('cardinalCellDistance', function () {
    context('when the positions are the same', function () {
      before(function () {
        this.p1 = {
          row: 0, col: 0
        };

        this.p2 = {
          row: 0, col: 0
        };
      });
      it('should return zero', function () {
        expect(Cell.cardinalPositionDistance(this.p1, this.p2)).to.eql(0);
      });
    });
    context('when the positions differ by one direction', function () {
      before(function () {
        this.p1 = {
          row: 0, col: 0
        };

        this.p2 = {
          row: 0, col: 1
        };
      });
      it('should return 1', function () {
        expect(Cell.cardinalPositionDistance(this.p1, this.p2)).to.eql(1);
      });
    });
    context('when the positions differ by a diagonal', function () {
      before(function () {
        this.p1 = {
          row: 0, col: 0
        };

        this.p2 = {
          row: 1, col: 1
        };
      });
      it('should return 2', function () {
        expect(Cell.cardinalPositionDistance(this.p1, this.p2)).to.eql(2);
      });
    });
  });
  describe('getCellsBetween', function () {
    it('should throw an error if the positions aren\'t in a straight line', function () {
      expect(() =>
        Cell.getPositionsBetween({ row: 0, col: 0 }, { row: 1, col: 1 })
      ).to.throw(Error);
    });
    it('should return the position if the two positions are the same', function () {
      const pos = {
        row: 1234, col: 5678
      };

      expect(Cell.getPositionsBetween(pos, pos)).to.eql([ pos ]);
    });
    it('should reorder the arguments if p2 is N/W of p1', function () {
      const p1 = {
        row: 10, col: 10
      };

      // p2 is North of p1
      const p2 = {
        row: 0, col: 10
      };

      expect(
        Cell.getPositionsBetween(p1, p2)
      ).to.eql(
        Cell.getPositionsBetween(p2, p1)
        );
    });
  });
});
