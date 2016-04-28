/* eslint no-console: 0 */
import proc from 'process';
import RandomWalkGen from './randomWalkMap';
import stringifyMap from './stringifyMap';

console.log(proc.argv);

let map = RandomWalkGen(proc.argv[2] || '1234', 40, 50);

console.log(stringifyMap(map));
