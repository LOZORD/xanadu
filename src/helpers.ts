import * as _ from 'lodash';

export function isApproximateSubstring(smaller: string, larger: string): boolean {
  return _.startsWith(larger.toLowerCase(), smaller.toLowerCase());
}

export function isApproximateString(a: string, b: string): boolean {
  return isApproximateSubstring(a, b) || isApproximateSubstring(b, a);
}

// A way to split a file's content into lines regardless of EOL type/encoding
export const GENERAL_LINE_SEPARATOR_REGEXP = /\r\n|\r|\n/;
