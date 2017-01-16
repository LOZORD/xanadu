import { expect } from 'chai';
import * as Item from './item';
import * as ItemCreator from './itemCreator';

describe('Item', function () {
  describe('getItem', function () {
    let stacks: Item.GenericItemStacks;
    before(function () {
      stacks = [
        Item.createItemStack(ItemCreator.createItem('Knife'), 1, 1),
        Item.createEmptyItemStack(ItemCreator.createItem('Dynamite'), 5)
      ];
    });
    context('when the item is present', function () {
      it('should return the correct stack', function () {
        expect(Item.getItem(stacks, 'Knife') !.item.name).to.eql('Knife');
      });
    });
    context('when the item is not present', function () {
      it('should return `undefined`', function () {
        expect(Item.getItem(stacks, 'Rifle')).to.be.undefined;
      });
    });
    context('when the item is present but the stack is empty', function () {
      it('should throw an error', function () {
        expect(() => Item.getItem(stacks, 'Dynamite')).to.throw(Error);
      });
    });
  });
  describe('hasItem', function () {
    let stacks: Item.GenericItemStacks;
    before(function () {
      stacks = [
        Item.createItemStack(ItemCreator.createItem('Knife'), 1, 1)
      ];
    });
    context('when the item is present', function () {
      it('should return `true`', function () {
        expect(Item.hasItem(stacks, 'Knife')).to.be.true;
      });
    });
    context('when the item is not present', function () {
      it('should return `false`', function () {
        expect(Item.hasItem(stacks, 'Raw Meat')).to.be.false;
      });
    });
  });
  describe('generateFullStacks', () => {
    it('should fill as many stacks as possible', () => {
      const item = ItemCreator.createItem('Alcohol');
      const amount = 5;
      const max = 2;

      const result = Item.generateFullStacks(item, amount, max);

      // 5 = 2 + 2 + 1
      expect(result).to.have.lengthOf(3);

      const firstStack = result[ 0 ];

      expect(firstStack.item).to.eql(item);
      expect(firstStack.maxStackAmount).to.eql(max);
      expect(firstStack.stackAmount).to.eql(max);

      expect(Item.stackIsFull(result[ 1 ])).to.be.true;
      expect(Item.stackIsFull(result[ 2 ])).to.be.false;
    });
  });
  describe('mergeStacks', () => {
    it('should properly merge stacks', () => {
      const origStacks = [
        Item.createItemStack(ItemCreator.createItem('Alcohol'), 4, 5),
        Item.createItemStack(ItemCreator.createItem('Knife'), 1, 2),
        Item.createItemStack(ItemCreator.createItem('Stew'), 2, 5),
        Item.createItemStack(ItemCreator.createItem('Alcohol'), 3, 5)
      ];

      const result = Item.mergeStacks(origStacks);

      expect(result.some(stack => stack.item.name === 'Alcohol' && Item.stackIsFull(stack)));
    });

    it('should throw an error if stacks of the same item don\'t have the same maxStackAmount', () => {
      const origStacks = [
        Item.createItemStack(ItemCreator.createItem('Alcohol'), 4, 5),
        Item.createItemStack(ItemCreator.createItem('Alcohol'), 1, 3)
      ];

      expect(
        () => Item.mergeStacks(origStacks)
      ).to.throw('Expected all Alcohol to have equal maxStackAmount');
    });
  });
});
