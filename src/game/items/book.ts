import { Item } from './item';

export type BookName = 'Modern Translation Book' | 'Map' | 'Ancient Translation Book';

export const names: BookName[] = [ 'Modern Translation Book', 'Map', 'Ancient Translation Book' ];

export type Name = BookName;

export interface Book extends Item {
  name: BookName;
}

export const MODERN_TRANSLATION_BOOK: Book = {
  name: 'Modern Translation Book'
};

export const MAP: Book = {
  name: 'Map'
};

export const ANCIENT_TRANSLATION_BOOK: Book = {
  name: 'Ancient Translation Book'
};
