import * as _ from 'lodash';

export function isApproximateSubstring(smaller: string, larger: string): boolean {
  return _.startsWith(larger.toLowerCase(), smaller.toLowerCase());
}

export function isApproximateString(a: string, b: string): boolean {
  return isApproximateSubstring(a, b) || isApproximateSubstring(b, a);
}
