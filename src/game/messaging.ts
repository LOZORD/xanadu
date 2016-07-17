// Messaging will now work like this:
// - A player creates a message of a certain type
// - The type of the message, combined with other information supplied by the player command,
//   determine who the recipients of the message are
// - The server dispatches the messages to the receiving players

export type MessageType = 'Game' | 'Echo' | 'Whisper' | 'Talk' | 'Shout';

export interface Message {
    type: MessageType;
    message: string;
}

// TODO: Use Player instances for from/to fields?
// TODO: Rename
export interface Dispatch {
    from: number;
    to: number[];
    message: Message;
}

// Because the message type &etc determines the recipient of the function, we return
// a function that can be given the recipients to give the correct Dispatch instance

export type messageFunc = (to: number[]) => Dispatch;

export function echoMessage(from: number, message: string): Dispatch {
    return {
        from,
        to: [from],
        message: {
            type: 'Echo',
            message
        }
    };
}
export function createMessage(from: number, message: string, type: MessageType): messageFunc {
    return function(to: number[]): Dispatch {
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
    return createMessage(0, message, 'Game');
}

export function whisperMessage(from: number, message: string): messageFunc {
    return createMessage(from, message, 'Whisper');
}

export function talkMessage(from: number, message: string): messageFunc {
    return createMessage(from, message, 'Talk');
}

export function shoutMessage(from: number, message: string): messageFunc {
    return createMessage(from, message, 'Shout');
}
