import { expect } from 'chai';
import * as Map from './map';

describe('Map', function () {
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
        expect(Map.cardinalCellDistance(this.p1, this.p2)).to.eql(0);
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
        expect(Map.cardinalCellDistance(this.p1, this.p2)).to.eql(1);
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
        expect(Map.cardinalCellDistance(this.p1, this.p2)).to.eql(2);
      });
    });
  });
});
