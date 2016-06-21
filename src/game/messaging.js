import _ from 'lodash';

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

    this.type = null; // abstract class
  }
  get message () {
    return this.response;
  }
  toJSON() {
    return {
      message:  this.response,
      //from: this.from,
      from: {
        id: this.from.id,
        name: this.from.name
      },
      //to:   this.to,
      to: {
        id: this.to.id,
        name: this.to.id
      },
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
      message:  this.response,
      to: {
        id: this.to.id,
        name: this.to.name
      }
    };
  }
}

export class BroadcastResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);
    this.type = 'broadcast';

    if (!this.to && !this.from) {
      throw new Error('Need a socket id to broadcast from!');
    }
  }
  // this sent to everyone so, the `to` field doesn't matter
  toJSON() {
    return {
      type: this.type, // i.e. 'broadcast'
      from: {
        id: this.from.id,
        name: this.from.name
      },
      message:  this.response
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
      message:  this.response,
      to: {
        id: this.to.id,
        name: this.to.name
      }
    };
  }
}

// TODO: this is a generic/abstract class to messaging between players
// e.g. this is the parent class for WhisperResponse, ShoutResponse, and ChatResponse
/*
 Whisper -> only allowed between two players
 Chat    -> anyone in the current room can hear (given language understanding)
 Shout   -> anyone in the current vicinity (e.g. 3-room radius) can hear

 Maybe have a Gesture type? (for players who cannot communicate)

 As for 'language understanding', if a player cannot understand the language a
 a message/response is uttered in, then the message content is substituted for
 something like "[player] says something to the room".
 */

// only supports messaging between two players
// a single `from` and a single `to`
export class PlayerResponse extends Response {
  constructor(kwargs = {}) {
    super(kwargs);

    this.type = null; // this is an abstract class

    if (!this.from) {
      throw new Error('PlayerResponse needs a `from` field!');
    }

    if (!this.to) {
      throw new Error('PlayerResponse needs a `to` field!');
    }
  }
  // we can inherit the Response.toJSON implementation
}

export class WhisperResponse extends PlayerResponse {
  constructor(kwargs = {}) {
    super(kwargs);

    this.type = 'whisper';
  }
  // inherit toJSON
}

export class MultiplePlayerResponse extends PlayerResponse {
  constructor(kwargs = {}) {
    super(kwargs);

    this.type = null; // abstract class

    if (!_.isArray(this.to)) {
      this.to = [this.to];
    }
  }
  isPersonalized() {
    return _.isPlainObject(this.response);
  }
  toPersonalizedJSON(socketId = null) {
    if (this.isPersonalized()) {
      if (!socketId) {
        throw new Error('Need a socket id to personalize!');
      }

      const toPlayer = _.find(this.to, (p) => p.id === socketId);

      return {
        message: this.response[socketId],
        type: this.type,
        to: {
          id: socketId,
          name: toPlayer.name
        },
        from: {
          id: this.from.id,
          name: this.from.name
        }
      };
    } else {
      return this.toJSON();
    }
  }

  toJSON() {
    if (this.isPersonalized()) {
      throw new Error('Only works with personalized socket ids!');
    }

    return {
      message: this.response,
      type: this.type,
      to: _.map(this.to, (p) => ({ id: p.id, name: p.name })),
      from: {
        id: this.from.id,
        name: this.from.name
      }
    };
  }

  /*
  toJSON(socketId) {
    if (this.isPersonalized()) {

      if (!socketId) {
        throw new Error('Need a socket id to personalize!');
      }

      return {
        message: this.response[socketId],
        type: this.type,
        to: socketId,
        from: this.from
      };
    } else {
      return {
        message: this.response,
        type: this.type,
        to: socketId || this.to,
        from: this.from
      };
    }
  }
  */
}

// The chat range is determined __by the game__
export class ChatResponse extends MultiplePlayerResponse {
  constructor(kwargs = {}) {
    super(kwargs);

    this.type = 'chat';
  }
  // inherit toJSON
}

// The shout range is determined __by the game__
export class ShoutResponse extends MultiplePlayerResponse {
  constructor(kwargs = {}) {
    super(kwargs);

    this.type = 'shout';
  }
  // inherit toJSON
}
