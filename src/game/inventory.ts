import * as _ from 'lodash';

import { Item, ItemStack } from './items/item';

export interface Inventory {
    items: ItemStack<Item>[];
    size: number;
}

export function createInventory(items: ItemStack<Item>[], size: number): Inventory {
    return {
        items: items,
        size: size
    };
}

export function inventoryIsEmpty(inventory: Inventory): boolean {
    return inventory.items.length === 0;
}

export function inventoryIsFull(inventory: Inventory): boolean {
    return inventory.items.length === inventory.size;
}

// TODO: Option type
export function getItem(inventory: Inventory, item: Item): ItemStack<Item> {
    return _.find(inventory.items, (i: ItemStack<Item>) => i.item.name === item.name);
}

export function hasItem(inventory: Inventory, item: Item): boolean {
    return !!getItem(inventory, item);
}
