import * as _ from 'lodash';
import { ItemName } from './itemName';

export interface Item {
  name: ItemName;
}

export interface ItemStack<I extends Item> {
  item: I;
  stackAmount: number;
  maxStackAmount: number;
}

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

export function getItem(stacks: ItemStack<Item>[], itemName: ItemName): ItemStack<Item> {
  const needle = _.find(stacks,
    (itemStack: ItemStack<Item>) => itemStack.item.name === itemName);

  // some odd condition (error) checking
  if (needle && stackIsEmpty(needle)) {
    throw new Error(`Empty item stack (${needle.item.name}) found in inventory!`);
  } else {
    // needle DNE or it is a non-empty stack
    return needle;
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
