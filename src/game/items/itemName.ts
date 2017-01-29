import { Name as BookNames, names as bookNames } from './book';
import { Name as IngestibleNames, names as ingestibleNames } from './ingestible';
import { Name as WeaponNames, names as weaponNames } from './weapon';
import { Name as CampSuppliesName, names as suppliesNames } from './campSupplies';
import { caseInsensitiveFind } from '../../helpers';

export type ItemName = BookNames | IngestibleNames | WeaponNames | CampSuppliesName;

export const itemNames: ItemName[] = ([] as ItemName[]).concat(
  bookNames, ingestibleNames, weaponNames, suppliesNames
);

export function stringToItemName(str: string, find = caseInsensitiveFind): ItemName | undefined {
  const needle = find(itemNames, str);

  if (needle) {
    return needle as ItemName;
  } else {
    return undefined;
  }
}

export function stringIsItemName(str: string, find = caseInsensitiveFind): str is ItemName {
  return stringToItemName(str, find) !== undefined;
}
