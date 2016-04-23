/* Taken from:
 * http://www.roguebasin.com/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
 * Try this too:
 * http://pixelenvy.ca/wa/ca_cave_demo.py.txt
 */
import _ from 'lodash';
import Rng from 'random-seed';
import F2DA from 'fixed-2d-array';

export const CELL_TYPES = {
  ROOM: '_',
  BARRIER: '#',
  TREASURE_ROOM: 'X',
  PASSAGE_ROOM: '^'
};

export default class CellularAutomataMapGenerator {
  constructor(seed = 1337, dimension = 16, percentWalls = 0.45, iterations = 3) {
    this.seed = seed;
    this.rng  = new Rng(this.seed);
    this.dim  = dimension;
    this.percentWalls = percentWalls;
    this.iterations = iterations;
    
    this.map = this.generateMap();
    

  }

  generateMap(){
    let buffer = this.getRandomBuffer();
    let bufferIndex = 0;
    for(let iteration = 0; iteration < this.iterations; iteration ++){
      let readIndex = bufferIndex;
      let writeIndex = 1 - bufferIndex;
      this.setWalls(buffer[readIndex],buffer[writeIndex]);
      bufferIndex = writeIndex;
    }
    return buffer[bufferIndex];
  }

  setWalls(readArr, writeArr){
    for(let i = 1; i < this.dim -1; i ++){
      for(let j = 1; j < this.dim -1; j ++){
        writeArr.set(i,j,this.getCellType(readArr,i,j));
      }
    }
  }

  getCellType(readArr, i, j){
    let count = 0;
    for(let q = i -1; q < i + 2; q ++){
      for(let r = j -1; r < j +2; r ++){
        if(readArr.get(q,r) === CELL_TYPES.BARRIER){
          count ++;
          if(count >= 5){
            return CELL_TYPES.BARRIER;
          }
        }
      }
    }
    return CELL_TYPES.ROOM;
  }

  getRandomBuffer(){
    let buffer = new Array(2);
    buffer[0] = new F2DA(this.dim, this.dim,CELL_TYPES.BARRIER);
    buffer[1] = new F2DA(this.dim, this.dim,CELL_TYPES.BARRIER);

    for(let i = 0; i < this.dim; i ++){
      for(let j = 0; j < this.dim; j ++){
        if(this.rng.floatBetween(0,1) > this.percentWalls){
          buffer[0].set(i,j,CELL_TYPES.ROOM);
        }
      }
    }
    return buffer;
  }

}    
