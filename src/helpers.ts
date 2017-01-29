import * as _ from 'lodash';

export function isApproximateSubstring(smaller: string, larger: string): boolean {
  return _.startsWith(larger.toLowerCase(), smaller.toLowerCase());
}

export function isApproximateString(a: string, b: string): boolean {
  return isApproximateSubstring(a, b) || isApproximateSubstring(b, a);
}

export function caseInsensitiveFind(haystack: string[], needle: string): string | undefined {
  const loNeedle = needle.toLowerCase();
  return _.find(haystack, elem => elem.toLowerCase() === loNeedle);
}

// A way to split a file's content into lines regardless of EOL type/encoding
export const GENERAL_LINE_SEPARATOR_REGEXP = /\r\n|\r|\n/;

// From http://stackoverflow.com/a/7616484
export function hashString(s: string): number {
  let hash = 0;

  if (s.length === 0) {
    return hash;
  }

  /* tslint:disable:no-bitwise */
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash |= 0; // Convert to 32bit integer
  }
  /* tslint:enable:no-bitwise */

  return hash;
}
