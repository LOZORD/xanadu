import Room from './room';

export default class TreasureRoom extends Room {
  toJSON() {
    return 'X';
  }
}
