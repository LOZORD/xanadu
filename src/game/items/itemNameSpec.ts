import { expect } from 'chai';
import * as ItemName from './itemName';

describe('ItemName', function () {
  describe('stringToItemName', function () {
    it('should return the actual item name (case insensitive)', function () {
      expect(ItemName.stringToItemName('medical KIT')).to.eql('Medical Kit');
    });
    it('should return `undefined` when the argument is not an item name', function () {
      expect(ItemName.stringToItemName('foo BAR baz')).to.be.undefined;
    });
  });
  describe('stringIsItemName', function () {
    it('should return `true` if the argument is an item name (case insensitive)', function () {
      expect(ItemName.stringIsItemName('rIfLE')).to.be.true;
    });
    it('should return `false` otherwise', function () {
      expect(ItemName.stringIsItemName('quux fLUUx')).to.be.false;
    });
  });
});
