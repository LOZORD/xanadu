// Messaging will now work like this:
// - A player creates a message of a certain type
// - The type of the message, combined with other information supplied by the player command,
//   determine who the recipients of the message are
// - The server dispatches the messages to the receiving players

import { Player, isApproximateName } from './player';
import * as _ from 'lodash';

export type MessageType = 'Game' | 'Echo' | 'Whisper' | 'Talk' | 'Shout';

export interface Message {
  from: Player | null;
  to: Player[];
  content: string;
  type: MessageType;
}

// Because the message type &etc determines the recipient of the function, we return
// a function that can be given the recipients to give the correct Message instance

export type messageFunc = (to: Player[]) => Message;

export function createMessage(from: Player | null, content: string, type: MessageType): messageFunc {
  return function (to: Player[]): Message {
    return {
      from,
      to,
      content,
      type
    };
  };
}

export function echoMessage(message: string): messageFunc {
  return createMessage(null, message, 'Echo');
}

export function createEchoMessage(message: string, player: Player): Message {
  return echoMessage(message)([ player ]);
}

export function gameMessage(message: string): messageFunc {
  return createMessage(null, message, 'Game');
}

export function createGameMessage(content: string, to: Player[]): Message {
  return gameMessage(content)(to);
}

export function whisperMessage(from: Player, message: string): messageFunc {
  return createMessage(from, message, 'Whisper');
}

export function createWhisperMessage(from: Player, content: string, to: Player) {
  return whisperMessage(from, content)([ to ]);
}

export function talkMessage(from: Player, message: string): messageFunc {
  return createMessage(from, message, 'Talk');
}

export function createTalkMessage(from: Player, content: string, to: Player[]) {
  return talkMessage(from, content)(to);
}

export function shoutMessage(from: Player, message: string): messageFunc {
  return createMessage(from, message, 'Shout');
}

export function createShoutMessage(from: Player, content: string, to: Player[]) {
  return shoutMessage(from, content)(to);
}

export interface MessageJSON {
  type: MessageType;
  message: string;
  from?: {
    name: string;
  };
}

// This is the representation of the response that is sent to the client via
// the `from`s socket.
export function show(response: Message): MessageJSON {
  const shown: any = {};

  if (response.from) {
    shown.from = {
      name: response.from.name
    };
  }

  shown.type = response.type;
  shown.message = response.content;

  return shown;
}

export type NameSpan = {
  names: string[],
  rest: string
};

export function spanMessagePlayerNames(content: string, players: Player[], equality = isApproximateName): NameSpan {
  const allPlayerNames = players.map(player => player.name).filter(maybeName => maybeName !== null) as string[];

  const splitContent = _.chain(content).split(' ');

  const namesFromMessage = splitContent
    .tail()
    .takeWhile(chunk => _.some(allPlayerNames, name => equality(chunk, name)))
    .map(chunk => _.find(allPlayerNames, name => equality(chunk, name)))
    .filter(maybeString => _.isString(maybeString)) // take out any undefineds
    .value() as string[];

  const restContent = splitContent
    .tail()
    .drop(namesFromMessage.length)
    .join(' ')
    .value();

  return {
    names: namesFromMessage,
    rest: restContent
  };
}
