import * as _ from 'lodash';
import * as Item from './items/item';
import { ItemName } from './items/itemName';
import { createItem } from './items/itemCreator';

export interface Inventory {
  itemStacks: Item.ItemStack<Item.Item>[];
  maximumCapacity: number;
}

export function createInventory(itemStacks: Item.ItemStack<Item.Item>[], size: number): Inventory {
  return removeEmptyStacks({
    maximumCapacity: size,
    itemStacks: _.take(itemStacks, size)
  });
}

export function inventoryIsEmpty(inventory: Inventory): boolean {
  return inventory.itemStacks.length === 0;
}

export function inventoryIsFull(inventory: Inventory): boolean {
  return inventory.itemStacks.length === inventory.maximumCapacity;
}

export function getItem(inventory: Inventory, itemName: ItemName): Item.ItemStack<Item.Item> | undefined {
  return Item.getItem(inventory.itemStacks, itemName);
}

export function hasItem(inventory: Inventory, itemName: ItemName): boolean {
  return Item.hasItem(inventory.itemStacks, itemName);
}

export function updateInventory(
  inventory: Inventory, itemName: ItemName, amount: number, maxAmount = amount
): Inventory {
  let newStack;

  if (hasItem(inventory, itemName)) {
    const itemStack = getItem(inventory, itemName);

    newStack = _.cloneDeep(itemStack);

    Item.changeStackAmount(newStack, amount);
  } else {
    const isFull = inventoryIsFull(inventory);
    if (!isFull && amount > 0) {
      newStack = Item.createItemStack(createItem(itemName), amount, maxAmount);
    } else if (isFull && amount > 0) {
      throw new Error(
        'Attempted to add a non-present item to a full inventory!'
      );
    } else {
      // amount <= 0
      throw new Error(
        'Attempted to update an inventory with a non-present item with a non-positive amount!'
      );
    }
  }

  const newItemStacks = Item.removeEmptyStacks(_.unionBy([ newStack ], inventory.itemStacks, 'item.name'));

  return {
    itemStacks: newItemStacks,
    maximumCapacity: inventory.maximumCapacity
  };
}

export function removeFromInventory(inventory: Inventory, itemName: ItemName, amount: number): {
  inventory: Inventory, itemStack: Item.ItemStack<Item.Item>
} {

  if (hasItem(inventory, itemName)) {
    const retrievedItemStack = getItem(inventory, itemName) !;
    const newInventory = updateInventory(inventory, itemName, -amount);
    return {
      inventory: newInventory,
      itemStack: Item.createItemStack(retrievedItemStack.item, amount, retrievedItemStack.maxStackAmount)
    };
  } else {
    throw new Error(`Attempted to remove non-present "${itemName}" from inventory!`);
  }
}

export function addToInventory(inventory: Inventory, itemName: ItemName, amount: number, maxAmount: number): Inventory {
  return updateInventory(inventory, itemName, amount, maxAmount);
}

// TODO: put other Item_JSON types in parens:
export type InventoryJSON = (Item.ItemStackJSON)[];

// FIXME: implement item condition (i.e. how much it needs to be repaired)
export function toJSON(inventory: Inventory): InventoryJSON {
  return inventory.itemStacks.map(itemStack =>
    ({ name: itemStack.item.name, stack: itemStack.stackAmount })
  );
}

export function removeEmptyStacks(inventory: Inventory): Inventory {
  const newInventory = _.cloneDeep(inventory);
  const newStacks = Item.removeEmptyStacks(inventory.itemStacks);
  newInventory.itemStacks = newStacks;
  return newInventory;
}
