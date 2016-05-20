// Abstract Response class
export default class Response {
  constructor(kwargs = {}) {
    this.response = kwargs.withResponse || kwargs.message || '[NO CONTENT]';
    this.from = kwargs.from || null;
    this.to   = kwargs.to   || [];
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
