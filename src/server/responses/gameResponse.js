import Response from './response';

export default class GameResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'game';
  }
  toJSON() {
    return {
      type: this.type,
      msg:  this.response,
      to:   this.to
    };
  }
}
