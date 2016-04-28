/* eslint no-console: 0  */
import proc from 'process';
import AMG from './automataMap';
import stringifyMap from './stringifyMap'

let parse = parseInt(proc.argv[3])/100.0;

let percWalls = isNaN(parse) ? 0.45 : parse;

let myMap = new AMG(proc.argv[2] || '1337', 40, percWalls);

console.log(stringifyMap(myMap.map));
