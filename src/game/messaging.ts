// Messaging will now work like this:
// - A player creates a message of a certain type
// - The type of the message, combined with other information supplied by the player command,
//   determine who the recipients of the message are
// - The server dispatches the messages to the receiving players

import { Player } from './player';

export type MessageType = 'Game' | 'Echo' | 'Whisper' | 'Talk' | 'Shout';

export interface Message {
    from: Player;
    to: Player[];
    content: string;
    type: MessageType;
}

// Because the message type &etc determines the recipient of the function, we return
// a function that can be given the recipients to give the correct Message instance

export type messageFunc = (to: Player[]) => Message;

export function echoMessage(from: Player, message: string): Message {
    return {
        from,
        to: [from],
        content: message,
        type: 'Echo'
    };
}

// for consistency's sake
export const createEchoMessage = echoMessage;

export function createMessage(from: Player, content: string, type: MessageType): messageFunc {
    return function(to: Player[]): Message {
        return {
            from,
            to,
            content,
            type
        };
    };
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
    return whisperMessage(from, content)([to]);
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
    from: {
        name: string;
    };
}

// TODO: support Broadcasts
// This is the representation of the response that is sent to the client via
// the `from`s socket.
export function show(response: Message): MessageJSON {
    return {
        type: response.type,
        message: response.content,
        from: {
            name: response.from.name
        }
    };
}
