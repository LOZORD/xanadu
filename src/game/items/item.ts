import * as _ from 'lodash';

export interface Item {
    name: string;
}

export interface ItemStack<I extends Item> {
    item: I;
    stackAmount: number;
    maxStackAmount: number;
}

export function createItemStack<I extends Item>(item: I, size: number): ItemStack<I> {
    return {
        item: item,
        stackAmount: 0,
        maxStackAmount: size
    };
}

export function stackIsEmpty(stack: ItemStack<Item>): boolean {
    return stack.stackAmount === 0;
}

export function stackIsFull(stack: ItemStack<Item>): boolean {
    return stack.stackAmount === stack.maxStackAmount;
}

export function changeStackAmount<I extends Item>(stack: ItemStack<I>, n: number): ItemStack<I> {
    return {
        item: stack.item,
        stackAmount: _.clamp(stack.stackAmount + n, 0, stack.maxStackAmount),
        maxStackAmount: stack.maxStackAmount
    };
}
