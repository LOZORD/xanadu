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

  let addMessage = (msg) => {
    messageOutput.append($('<li>').text(msg));
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  socket.on('rejected-from-room', () => {
    addMessage('GAME ROOM AT CAPACITY');
    setTimeout(() => { window.location = 'http://example.com' }, 5000);
  });

  socket.on('message', (data) => {
    console.log('message', data);
    addMessage(JSON.stringify(data));
  });

  // DEPRECATED
  socket.on('update', (data) => {
    console.log('update', data);
  });
});
