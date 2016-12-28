import { expect } from 'chai';
import * as Item from './item';
import * as ItemCreator from './itemCreator';

type GenericItemStacks = Item.ItemStack<Item.Item>[];

describe('Item', function () {
  describe('getItem', function () {
    before(function () {
      this.stacks = [
        Item.createItemStack(ItemCreator.createItem('Knife'), 1, 1),
        Item.createEmptyItemStack(ItemCreator.createItem('Dynamite'), 5)
      ] as GenericItemStacks;
    });
    context('when the item is present', function () {
      it('should return the correct stack', function () {
        expect(Item.getItem(this.stacks, 'Knife').item.name).to.eql('Knife');
      });
    });
    context('when the item is not present', function () {
      it('should return `undefined`', function () {
        expect(Item.getItem(this.stacks, 'Rifle')).to.be.undefined;
      });
    });
    context('when the item is present but the stack is empty', function () {
      it('should throw an error', function () {
        expect(() => Item.getItem(this.stacks, 'Dynamite')).to.throw(Error);
      });
    });
  });
  describe('hasItem', function () {
    before(function () {
      this.stacks = [
        Item.createItemStack(ItemCreator.createItem('Knife'), 1, 1)
      ] as GenericItemStacks;
    });
    context('when the item is present', function () {
      it('should return `true`', function () {
        expect(Item.hasItem(this.stacks, 'Knife')).to.be.true;
      });
    });
    context('when the item is not present', function () {
      it('should return `false`', function () {
        expect(Item.hasItem(this.stacks, 'Raw Meat')).to.be.false;
      });
    });
  });
});
