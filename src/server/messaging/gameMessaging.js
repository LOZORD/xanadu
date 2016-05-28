// Abstract Response class
export class Response {
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

export class EchoResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'echo';
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

export class BroadcastResponse extends Response {
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

export class GameResponse extends Response {
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

// TODO: this is a generic/abstract class to messaging between players
// e.g. this is the parent class for WhipserResponse, ShoutResponse, and ChatResponse
/*
 Whisper -> only allowed between two players
 Chat    -> anyone in the current room can hear (given language understanding)
 Shout   -> anyone in the current vicinity (e.g. 3-room radius) can hear

 Maybe have a Gesture type? (for players who cannot communicate)

 As for 'language understanding', if a player cannot understand the language a
 a message/response is uttered in, then the message content is substituted for
 something like "[player] says something to the room".
 */

export class PlayerMessage extends Response {
  
}