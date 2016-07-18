// Messaging will now work like this:
// - A player creates a message of a certain type
// - The type of the message, combined with other information supplied by the player command,
//   determine who the recipients of the message are
// - The server dispatches the messages to the receiving players

import { Player } from './player';

export type MessageType = 'Game' | 'Echo' | 'Whisper' | 'Talk' | 'Shout' | 'PlayerBroadcast' | 'GameBroadcast' | 'Chat';

export interface Message {
    type: MessageType;
    message: string;
}

// TODO: Rename
export interface Dispatch {
    from: Player;
    to: Player[];
    message: Message;
}

/*
export interface Broadcast {
    from: string;
    message: Message;
    // note that there's no `to` field -- broadcasts go to everyone BUT the `from`
}
*/

//export type Response = Dispatch | Broadcast;

// Because the message type &etc determines the recipient of the function, we return
// a function that can be given the recipients to give the correct Dispatch instance

export type messageFunc = (to: Player[]) => Dispatch;

export function echoMessage(from: Player, message: string): Dispatch {
    return {
        from,
        to: [from],
        message: {
            type: 'Echo',
            message
        }
    };
}
export function createMessage(from: Player, message: string, type: MessageType): messageFunc {
    return function(to: Player[]): Dispatch {
        return {
            from,
            to,
            message: {
                type,
                message
            }
        };
    };
}

export function gameMessage(message: string): messageFunc {
    return createMessage(null, message, 'Game');
}

export function whisperMessage(from: Player, message: string): messageFunc {
    return createMessage(from, message, 'Whisper');
}

export function talkMessage(from: Player, message: string): messageFunc {
    return createMessage(from, message, 'Talk');
}

export function shoutMessage(from: Player, message: string): messageFunc {
    return createMessage(from, message, 'Shout');
}

export function playerBroadcastMessage(from: Player, message: string): messageFunc {
    return createMessage(from, message, 'PlayerBroadcast');
}

export function gameBroadcastMessage(message: string): messageFunc {
    return createMessage(null, message, 'GameBroadcast');
}

export interface DispatchJSON {
    type: MessageType;
    message: string;
    from: {
        name: string;
    };
}

// TODO: for when we actually implement Broadcasting
export interface BroadcastJSON {
    message: string;
    type: MessageType;
    from?: {
        name: string;
    };
}

export type MessageJSON = DispatchJSON | BroadcastJSON;

// TODO: support Broadcasts
// This is the representation of the response that is sent to the client via
// the `from`s socket.
export function show(response: Dispatch): MessageJSON {
    return {
        type: response.message.type,
        message: response.message.message,
        from: {
            name: response.from.name
        }
    };
}