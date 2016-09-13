import { Item }from './item';

export type CampSuppliesName = 'Camp Supplies';
export type Name = CampSuppliesName;

export interface CampSupplies extends Item {
  name: Name;
}

export const CAMP_SUPPLIES: CampSupplies = {
  name: 'Camp Supplies'
};

