import * as _ from 'lodash';
import { ItemName } from './itemName';

export interface Item {
  name: ItemName;
}

export interface ItemStack<I extends Item> {
  itemName: ItemName;
  stackAmount: number;
  maxStackAmount: number;
}

export function createItemStack<I extends Item>
  (itemName: ItemName, stackAmount: number, maxStackAmount = stackAmount): ItemStack<I> {
  return {
    itemName,
    maxStackAmount,
    stackAmount: _.clamp(stackAmount, 0, maxStackAmount)
  };
}

export function createEmptyItemStack<I extends Item>(itemName: ItemName, size: number): ItemStack<I> {
  return createItemStack(itemName, 0, size);
}

export function stackIsEmpty(stack: ItemStack<Item>): boolean {
  return stack.stackAmount === 0;
}

export function stackIsFull(stack: ItemStack<Item>): boolean {
  return stack.stackAmount === stack.maxStackAmount;
}

export function changeStackAmount(stack: ItemStack<Item>, n: number): void {
  stack.stackAmount = _.clamp(stack.stackAmount + n, 0, stack.maxStackAmount);
}

export interface ItemJSON {
  name: string;
}

export interface ItemStackJSON extends ItemJSON {
  stack: number;
}
