import * as _ from 'lodash';
import { ItemName } from './itemName';
import { hashString } from '../../helpers';

export interface Item {
  name: ItemName;
}

export interface ItemStack<I extends Item> {
  item: I;
  stackAmount: number;
  maxStackAmount: number;
}

export type GenericItemStacks = ItemStack<Item>[];

export function createItemStack<I extends Item>(
  item: I, stackAmount: number, maxStackAmount = stackAmount
): ItemStack<I> {
  return {
    item,
    maxStackAmount,
    stackAmount: _.clamp(stackAmount, 0, maxStackAmount)
  };
}

export function createEmptyItemStack<I extends Item>(item: I, maxStackAmount: number): ItemStack<I> {
  return createItemStack(item, 0, maxStackAmount);
}

export function stackIsEmpty<I extends Item>(stack: ItemStack<I>): boolean {
  return stack.stackAmount === 0;
}

export function stackIsFull<I extends Item>(stack: ItemStack<I>): boolean {
  return stack.stackAmount === stack.maxStackAmount;
}

export function changeStackAmount<I extends Item>(stack: ItemStack<I>, n: number): void {
  stack.stackAmount = _.clamp(stack.stackAmount + n, 0, stack.maxStackAmount);
}

export function getItem(stacks: ItemStack<Item>[], itemName: ItemName): ItemStack<Item> | undefined {
  const needle = _.find(stacks,
    (itemStack: ItemStack<Item>) => itemStack.item.name === itemName);

  if (!needle) {
    return undefined;
  } else if (!stackIsEmpty(needle)) {
    return needle;
  } else {
    // some odd condition (error) checking
    throw new Error(`Empty item stack (${needle.item.name}) found in inventory!`);
  }
}

export function hasItem(stacks: ItemStack<Item>[], itemName: ItemName): boolean {
  return Boolean(getItem(stacks, itemName));
}

export interface ItemJSON {
  name: string;
}

export interface ItemStackJSON extends ItemJSON {
  stack: number;
}

export function removeEmptyStacks(stacks: ItemStack<Item>[]): ItemStack<Item>[] {
  return _.filter(stacks, _.negate(stackIsEmpty));
}

export function itemHash(item: Item): number {
  return hashString(JSON.stringify(item));
}

export function mergeStacks(stacks: GenericItemStacks): GenericItemStacks {
  // TODO: do we want the original order?
  //const origOrder = _.map(stacks, (stack, ind) => ({name: stack.item.name, index: ind}));
  // TODO: this might give away certain properties for different items (e.g. poison)
  const groupedStacks = _.groupBy(stacks, stack => itemHash(stack.item));
  const mergedGroups = _.reduce(groupedStacks, (acc, stacksToMerge) => {
    //console.log(stacksToMerge);
    const firstMaxAmount = stacksToMerge[ 0 ].maxStackAmount;
    const totalAmount = _.sumBy(stacksToMerge, stack => {
      // sanity check
      if (stack.maxStackAmount !== firstMaxAmount) {
        throw new Error(
          `Expected all ${stacksToMerge[ 0 ].item.name} to have equal maxStackAmount
          (first: ${firstMaxAmount}, found: ${stack.maxStackAmount})`
        );
      }

      return stack.stackAmount;
    });

    const maxStackAmount = stacksToMerge[ 0 ].maxStackAmount;
    const item = stacksToMerge[ 0 ].item;

    return acc.concat(generateFullStacks(item, totalAmount, maxStackAmount));
  }, [] as GenericItemStacks);

  return mergedGroups;
}

export function generateFullStacks(item: Item, amount: number, max: number): GenericItemStacks {
  if (amount <= 0) {
    return [];
  } else {
    const currAmount = Math.min(amount, max);

    return [ createItemStack(item, currAmount, max) ].concat(
      generateFullStacks(item, amount - currAmount, max)
    );
  }
}
