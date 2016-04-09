let proc = require('process');
console.log(proc.argv);
let RandomWalkGen = require('./randomWalkMap');

let stringifyMap = require('./stringifyMap');

let map = RandomWalkGen(proc.argv[2] || '1234', 40, 50);

console.log(stringifyMap(map));
