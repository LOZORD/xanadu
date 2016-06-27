import _ from 'lodash';
import * as Responses from '../game/messaging';

// this is a simple communication handler
// it was designed to work with the Lobby class
// and not nec. the Game class
// THIS DOES NOT UPDATE STATE
// IT ONLY HANDLES COMMUNICATION MESSAGES
// feel free to do whatever with it...
export function abstractHandler(responseHandling) {
  const defaultResponseType = _.find(responseHandling, (obj) => obj.matches === true);

  const typesToCheck = _.filter(responseHandling, (obj) => obj !== defaultResponseType);

  return function(messageObj, fromPlayer, context) {
    const originalMessage = messageObj.message;

    const words = originalMessage.split(' ');

    const prefix = words[0];

    let myResponseType = _.find(typesToCheck, (obj) => _.some(obj.matches, (m) => m === prefix));

    let defaultUsed = false;

    if (!myResponseType) {
      myResponseType = defaultResponseType;
      defaultUsed = true;
    }

    let to;
    let messageToSend;

    const messagePayload = defaultUsed ? words : _.tail(words);

    if (myResponseType.includesNames) {
      // TODO: handle case of missing recipient name (1st name for Multiple)
      // TODO: allow for "startsWith" and case-insensitive matching
      const shouldHandleMultipleRecipients =
        Responses.MultiplePlayerResponse.isPrototypeOf(myResponseType.responseConstructor);

      if (shouldHandleMultipleRecipients) {
        const toNames = _.takeWhile(messagePayload, (possibleName) => context.hasPlayerWithName(possibleName));

        to = _.map(toNames, (name) => context.getPlayerWithName(name));

        messageToSend = _.drop(messagePayload, to.length).join(' ');
      } else {
        to = context.getPlayerWithName(messagePayload[0]);

        messageToSend = _.tail(messagePayload).join(' ');
      }
    } else {
      messageToSend = messagePayload.join(' ');
    }

    return myResponseType.create(messageToSend, to, fromPlayer);

    /*
    return new (myResponseType.responseConstructor)(
        messageToSend, to, fromPlayer
    );

    if (myResponseType.responseConstructor === BroadcastResponse
        || BroadcastResponse.isPrototypeOf(myResponseType.responseConstructor)) {
      return new (myResponseType.responseConstructor)(messageToSend, fromPlayer);
    } else {
      return
    }
    */
  };
}

const RESPONSE_HANDLING = [
  {
    responseConstructor: Responses.BroadcastResponse,
    create: (message, to, from, withName = true) =>
      new Responses.BroadcastResponse(message, from, withName),
    matches: true // default to Broadcast in the Lobby
  },
  {
    responseConstructor: Responses.ChatResponse,
    create: (message, to, from) =>
      new Responses.ChatResponse(message, to, from),
    matches: ['c', 'chat'],
    includesNames: true
  },
  {
    responseConstructor: Responses.WhisperResponse,
    create: (message, to, from) =>
      new Responses.WhisperResponse(message, to, from),
    matches: ['w', 'whisper'],
    includesNames: true
  }
];

export default abstractHandler(RESPONSE_HANDLING);
