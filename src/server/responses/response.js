// Abstract Response class
export default class Response {
  constructor(kwargs = {}) {
    this.response = kwargs.message || '[NO CONTENT]';
    this.from = kwargs.from || null;
    this.to   = kwargs.to   || null;

    /* XXX: do we want this check?
    if (!this.to || this.to.length === 0) {
      throw new Error('Attempted to send a message to no one!')
    }
    */

    this.type = null; 
  }
  toJSON() {
    return {
      msg:  this.response,
      from: this.from,
      to:   this.to,
      type: this.type
    };
  }
}
