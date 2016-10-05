import * as Item from './item';
import * as ItemName from './itemName';
import * as Book from './book';
import * as Ingestible from './ingestible';
import * as Weapon from './weapon';
import * as CampSupplies from './campSupplies';
import { cloneDeep } from 'lodash';

const NAME_TO_ITEM = {
  'Map': Book.MAP,
  'Ancient Translation Book': Book.ANCIENT_TRANSLATION_BOOK,
  'Modern Translation Book': Book.MODERN_TRANSLATION_BOOK,
  'Knife': Weapon.KNIFE,
  'Pickaxe': Weapon.PICKAXE,
  'Rifle': Weapon.RIFLE,
  'Rifle Bullet': Weapon.RIFLE_BULLET,
  'Revolver': Weapon.REVOLVER,
  'Revolver Bullet': Weapon.REVOLVER_BULLET,
  'Dynamite': Weapon.DYNAMITE,
  'Raw Meat': Ingestible.RAW_MEAT,
  'Cooked Meat': Ingestible.COOKED_MEAT,
  'Stew': Ingestible.STEW,
  'Honeydew': Ingestible.HONEYDEW,
  'Cave Leaf': Ingestible.CAVE_LEAF,
  'Nightshade': Ingestible.NIGHTSHADE,
  'Dark Poppy': Ingestible.DARK_POPPY,
  'Water': Ingestible.WATER,
  'Alph Water': Ingestible.ALPH_WATER,
  'Alcohol': Ingestible.ALCOHOL,
  'Morphine': Ingestible.MORPHINE,
  'Opium': Ingestible.OPIUM,
  'Medical Kit': Ingestible.MEDICAL_KIT,
  'Poison Antidote': Ingestible.POISON_ANTIDOTE,
  'Poison': Ingestible.POISON,
  'Camp Supplies': CampSupplies.CAMP_SUPPLIES
};

export function createItem(name: ItemName.ItemName): Item.Item {
  const item = NAME_TO_ITEM[name] as Item.Item;

  if (!item) {
    throw new Error(`Item "${name}" has not been added for creation!`);
  } else {
    return cloneDeep(item);
  }
}
