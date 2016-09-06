import { Item } from './item';

export type BookName = 'Modern Translation Book';

export type Names = BookName;

export interface Book extends Item {
  name: BookName;
}

export const MODERN_TRANSLATION_BOOK: Item = {
  name: 'Modern Translation Book'
};
