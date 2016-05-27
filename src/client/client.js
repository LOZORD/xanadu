/* global io */
let socket = io('/game');

$(document).ready(() => {
  let messageOutput   = $('#messages');
  let detailOutput    = $('#details');

  let form = $('#main-form');
  let input = $('#main-input');

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val().trim();
    input.val('');
    console.log('Sending message: ', msg);
    sendMessage(msg);
  });

  let sendMessage = (msg) => {
    socket.emit('message', {
      msg: msg,
      ts: Date.now()
    });
  };

  let processData = (data) => {
    switch (data.type) {
      case 'broadcast': {
        let broadcastIntro;

        if (data.from) {
          broadcastIntro = `Let it be known that ${ data.from } said: `;
        } else {
          broadcastIntro = `Let it be known that: `;
        }

        let broadcastMessage = broadcastIntro + data.msg;
        return {
          messageText: broadcastMessage,
          styleClasses: ['broadcast']
        };
      }
      case 'chat': {
        return {
          messageText: `${ data.from }: ${ data.msg }`,
          styleClasses: ['chat']
        };
      }
      case 'echo': {
        return {
          messageText: data.msg,
          styleClasses: ['echo']
        };
      }
      case 'game': {
        return {
          messageText: data.msg,
          styleClasses: ['game']
        };
      }
      case 'shout': {
        return {
          messageText: `${ data.from } shouted: ${ data.msg }`,
          styleClasses: ['shout']
        };
      }
      case 'whisper': {
        return {
          messageText: `${ data.from } whispered: ${ data.msg }`,
          styleClasses: ['whisper']
        };
      }
      default: {
        console.log('unknown message type:', data);
        return {
          messageText: data.msg,
          styleClasses: ['unknown']
        };
      }
    }
  };

  let addMessage = (messageText, styleClasses = []) => {
    // use `.text` so whatever we put in the element will only be treated as
    // text and _not_ HTML (or worse, JS)
    // XXX: maybe do we want a <pre> _inside_ the <li>?
    let newElem = $('<li>').text(messageText);
    newElem.addClass(styleClasses.join(' '));
    messageOutput.append(newElem);
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  // Basic welcome message
  // TODO: add word art and/or better/helpful message)
  addMessage('Please enter your name below...', ['game']);

  /*** MESSAGE HANDLER ***/

  socket.on('message', (data) => {
    console.log('Received message:', data);
    let { messageText, styleClasses } = processData(data);
    addMessage(messageText, styleClasses);
  });

  /*** ERROR HANDLER ***/

  // TODO: find a way to gracefully handle and report server crashes to client
  // this might help:
  // http://socket.io/docs/server-api/#namespace#use(fn:function):namespace
  socket.on('error', (error) => {
    addMessage('The server has encountered a fatal error!', ['error']);
    console.log('Received error data: ', error);
    socket.disconnect();
  });

  /*** REJECTED FROM ROOM ***/

  socket.on('rejected-from-room', () => {
    addMessage({
      messageText: 'The game is at capacity',
      styleClasses: ['game']
    });
    socket.disconnect();
  });

  /*** DETAILS (RHS PANE) ***/

  // TODO: see below --> eventually need to render data in correct places
  let updateDetails = (data) => {
    detailOutput.text(JSON.stringify(data));
  };

  // TODO: details stream (i.e. inventory, map, etc.) on RHS
  socket.on('details', (data) => {
    console.log('details', data);
    updateDetails(data);
  });

  /*** FINAL VIEW SETUP ***/
  input.focus();
});
