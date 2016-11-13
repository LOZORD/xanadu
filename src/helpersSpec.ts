import { expect } from 'chai';
import * as Helpers from './helpers';

describe('Helpers', function () {
  describe('caseInsensitiveFind', function () {
    it('should return the element if it exists', function () {
      expect(
        Helpers.caseInsensitiveFind([ 'Hello', 'World' ], 'Hello')
      ).to.eql('Hello');
    });
    it('should return the found word if it matches without case', function () {
      expect(
        Helpers.caseInsensitiveFind([ 'hello', 'aloha', 'bonjour' ], 'ALOHA')
      ).to.eql('aloha');
    });
    it('should return undefined if there is no match', function () {
      expect(
        Helpers.caseInsensitiveFind([ 'A', 'b', 'C' ], 'd')
      ).to.be.undefined;
    });
  });
});
