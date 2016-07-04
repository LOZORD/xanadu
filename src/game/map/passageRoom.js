import Room from './room';

export default class PassageRoom extends Room {
  toJSON() {
    return '^';
  }
}
