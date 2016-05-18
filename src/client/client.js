/* global io */
let socket = io('/game');

$(document).ready(() => {
  //let parentContainer = $('#parent-container');
  let messageOutput   = $('#messages');
  let detailOutput    = $('#details');

  let form = $('#main-form');
  let input = $('#main-input');

  input.focus();

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val().trim();
    input.val('');
    console.log(msg);
    sendMessage(msg);
  });

  let sendMessage = (msg) => {
    socket.emit('message', {
      msg: msg,
      ts: Date.now(),
      id: socket.id
    });
  };

  let processData = (data) => {
    var ret = {};
    ret.message = data.message;
    ret.classes = []; // in case we want to add multiple classes

    if (data.type === 'echo') {
      ret.classes.push('via-echo');
    } else if (data.type === 'message') {
      ret.classes.push('via-message');
    } else if (data.type === 'whisper') {
      ret.message = data.speaker + ' said: ' + ret.message;
      ret.classes.push('via-whisper');
    } else if (data.type === 'broadcast') {
      ret.message = `Let it be known that${ data.speaker ? ` ${ data.speaker } said` : '' }: ${ ret.message }`;
      ret.classes.push('via-broadcast');
    } else {
      console.log('unknown message data type');
      ret.classes.push('unknown-message-data-type');
    }

    return ret;
  };

  let addMessage = (processedData) => {
    var msg = processedData.message;
    var classes = processedData.classes || [];
    var newElem = $('<li>').text(msg);
    if (processedData.classes) {
      newElem.addClass(classes.join(' '));
    }
    messageOutput.append(newElem);
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  // Basic welcome message
  addMessage({
    message: 'Please enter your name below...'
  });

  socket.on('rejected-from-room', () => {
    addMessage('GAME ROOM AT CAPACITY');
    setTimeout(() => { window.location = 'http://example.com' }, 5000);
  });

  socket.on('message', (data) => {
    console.log('message', data);
    var processedData = processData(data);
    console.log(processedData);
    addMessage(processedData);
  });

  // TODO: see below
  let updateDetails = (data) => {
    detailOutput.text(JSON.stringify(data));
  };

  // TODO: details stream (i.e. inventory, map, etc.) on RHS
  socket.on('details', (data) => {
    console.log('details', data);
    updateDetails(data);
  });

  // DEPRECATED
  socket.on('update', (data) => {
    console.log('update', data);
  });
});
