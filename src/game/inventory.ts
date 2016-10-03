import * as _ from 'lodash';
import { Item, ItemStack, ItemStackJSON, changeStackAmount, createItemStack, stackIsEmpty } from './items/item';
import { ItemName } from './items/itemName';
import { createItem } from './items/itemCreator';

export interface Inventory {
  itemStacks: ItemStack<Item>[];
  size: number;
}

export function createInventory(itemStacks: ItemStack<Item>[], size: number): Inventory {
  return {
    size,
    itemStacks: removeEmptyStacks(_.take(itemStacks, size))
  };
}

export function inventoryIsEmpty(inventory: Inventory): boolean {
  return inventory.itemStacks.length === 0;
}

export function inventoryIsFull(inventory: Inventory): boolean {
  return inventory.itemStacks.length === inventory.size;
}

export function getItem(inventory: Inventory, itemName: ItemName): ItemStack<Item> {
  const needle = _.find(inventory.itemStacks,
    (itemStack: ItemStack<Item>) => itemStack.item.name === itemName);

  // some odd condition (error) checking
  if (needle && stackIsEmpty(needle)) {
    throw new Error(`Empty item stack (${needle.item.name}) found in inventory!`);
  } else {
    // needle DNE or it is a non-empty stack
    return needle;
  }
}

export function hasItem(inventory: Inventory, itemName: ItemName): boolean {
  return Boolean(getItem(inventory, itemName));
}

export function updateInventory(
  inventory: Inventory, itemName: ItemName, amount: number, maxAmount = amount
): Inventory {
  let newStack;

  if (hasItem(inventory, itemName)) {
    const itemStack = getItem(inventory, itemName);

    newStack = _.cloneDeep(itemStack);

    changeStackAmount(newStack, amount);
  } else {
    if (!inventoryIsFull(inventory) && amount > 0) {
      newStack = createItemStack(createItem(itemName), amount, maxAmount);
    } else {
      return inventory;
    }
  }

  const newItemStacks = removeEmptyStacks(_.unionBy([ newStack ], inventory.itemStacks, 'item.name'));

  return {
    itemStacks: newItemStacks,
    size: inventory.size
  };
}

export function removeFromInventory(inventory: Inventory, itemName: ItemName, amount: number): {
  inventory: Inventory, itemStack: ItemStack<Item>
} {

  if (hasItem(inventory, itemName)) {
    const retrievedItemStack = getItem(inventory, itemName);
    const newInventory = updateInventory(inventory, itemName, -amount);
    return {
      inventory: newInventory,
      itemStack: createItemStack(retrievedItemStack.item, amount, retrievedItemStack.maxStackAmount)
    };
  }
}

export function addToInventory(inventory: Inventory, itemName: ItemName, amount: number, maxAmount: number): Inventory {
  return updateInventory(inventory, itemName, amount, maxAmount);
}

export function stackMap<I extends Item>(inventory: Inventory, itemName: ItemName, f: (item: Item) => Item): Inventory {
  const itemStack = getItem(inventory, itemName);

  if (itemStack) {
    itemStack.item = f(itemStack.item);
    return inventory;
  } else {
    return null;
  }
}

// TODO: put other Item_JSON types in parens:
export type InventoryJSON = (ItemStackJSON)[];

// FIXME: implement item condition (i.e. how much it needs to be repaired)
export function toJSON(inventory: Inventory): InventoryJSON {
  return inventory.itemStacks.map(itemStack =>
    ({ name: itemStack.item.name, stack: itemStack.stackAmount })
  );
}

export function removeEmptyStacks(stacks: ItemStack<Item>[]): ItemStack<Item>[] {
  return _.filter(stacks, _.negate(stackIsEmpty));
}
