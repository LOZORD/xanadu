import Response from './response';
export default class BroadcastResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'broadcast';
  }
  // this sent to everyone so, the `to` field doesn't matter
  toJSON() {
    return {
      type: this.type, // i.e. 'broadcast'
      from: this.from,
      msg:  this.response
    };
  }
}
