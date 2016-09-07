import { Item } from './item';

export type BookName = 'Modern Translation Book' | 'Map';

export type Names = BookName;

export interface Book extends Item {
  name: BookName;
}

export const MODERN_TRANSLATION_BOOK: Book = {
  name: 'Modern Translation Book'
};

export const MAP: Book = {
  name: 'Map'
};
