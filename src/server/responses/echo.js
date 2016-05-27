import Response from './response';

export default class EchoResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'echo';
    if (!this.from) {
      throw new Error('EchoResponse needs a `from` field!');
    }
    this.to = this.to || this.from;
  }
  toJSON() {
    return {
      type: this.type,
      msg:  this.response,
      to:   this.to
    };
  }
}
