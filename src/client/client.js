let socket = io();

$(document).ready(() => {
  let parentContainer = $('#parent-container');
  let messageOutput   = $('#messages');

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
    socket.emit('message', msg);
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
    } else {
      console.err('unknown message data type');
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

  // DEPRECATED
  socket.on('update', (data) => {
    console.log('update', data);
  });
});
