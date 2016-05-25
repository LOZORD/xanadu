import Response from './response';

export default class EchoResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'echo';
    if (!this.from) {
      throw new Error('EchoResponse needs a `from` field!');
    }
    this.to = [this.from];
  }
  toJSON() {
    return {
      type: this.type,
      from: this.from,
      msg:  this.response,
      to:   this.from
    };
  }
}
