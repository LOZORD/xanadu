import Room from './room';

export default class TreasureRoom extends Room {
  constructor(kwargs) {
    super(kwargs);
  }
  toJSON() {
    return 'X';
  }
}
