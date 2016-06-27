import _ from 'lodash';

// Abstract Response class
export default class Response {
  // message : String
  // to : Player
  // from : Player
  constructor(message, to, from) {
    this.type = null; // abstract class
    this.response = message || '[NO CONTENT]';
    this.to       = to      || null;
    this.from     = from    || null;
  }
  get message () {
    return this.response;
  }
  toJSON() {
    return {
      message:  this.response,
      from: {
        id: this.from.id,
        name: this.from.name
      },
      to: {
        id: this.to.id,
        name: this.to.id
      },
      type: this.type
    };
  }
}

export class EchoResponse extends Response {
  constructor(message, to) {
    super(message, to, null);
    this.type = 'echo';
    this.to = this.to;
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
  constructor(message, from, withName = true) {
    super(message, null, from);
    this.type = 'broadcast';
    this.withName = withName;
  }
  // this sent to everyone so, the `to` field doesn't matter
  toJSON() {
    return {
      type: this.type,
      from: {
        id: this.from.id,
        name: this.from.name
      },
      message:  this.response,
      withName: this.withName
    };
  }
}

export class GameBroadcastResponse extends BroadcastResponse {
  constructor(message) {
    super(message, null, false);
    this.type = 'game-broadcast';
  }
  toJSON() {
    return {
      type: this.type,
      message: this.response
    };
  }
}

export class GameResponse extends Response {
  constructor(message, to) {
    super(message, to, null);
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

// This is a generic/abstract class to messaging between players
// e.g. this is the parent class for WhisperResponse, ShoutResponse, and ChatResponse
/*
 Whisper -> only allowed between two players
 Chat    -> anyone in the current room can hear (given language understanding during gameplay)
 Shout   -> anyone in the current vicinity (e.g. 3-room radius) can hear

 XXX: Maybe have a Gesture type? (for players who cannot communicate)

 XXX: As for 'language understanding', if a player cannot understand the language a
 a message/response is uttered in, then the message content is substituted for
 something like "[player] says something to the room".
 */

// only supports messaging between two players
// a single `from` and a single `to`
export class PlayerResponse extends Response {
  constructor(message, to, from) {
    super(message, to, from);

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
  constructor(message, to, from) {
    super(message, to, from);

    this.type = 'whisper';
  }
  // inherit toJSON
}

export class MultiplePlayerResponse extends PlayerResponse {
  constructor(message, toList, from) {
    super(message, toList, from);

    this.type = null; // abstract class

    if (!_.isArray(this.to)) {
      throw new Error('`to` argument must be an Array!');
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

      if (!toPlayer) {
        throw new Error('Missing player for personalization!');
      }

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

  toJSON(socketId = null) {
    if (this.isPersonalized()) {
      if (socketId) {
        return this.toPersonalizedJSON(socketId);
      } else {
        throw new Error('Only works with personalized socket ids!');
      }
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
}

// The chat range is determined __by the game__
export class ChatResponse extends MultiplePlayerResponse {
  constructor(message, toList, from) {
    super(message, toList, from);

    this.type = 'chat';
  }
  // inherit toJSON
}

// The shout range is determined __by the game__
export class ShoutResponse extends MultiplePlayerResponse {
  constructor(message, toList, from) {
    super(message, toList, from);

    this.type = 'shout';
  }
  // inherit toJSON
}
