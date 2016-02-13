let socket = io();

$(document).ready(() => {
  let parentContainer = $('#parent-container');
  let messageOutput   = $('#messages');

  let form = $('#main-form');
  let input = $('#main-input');

  form.submit((event) => {
    event.preventDefault();
    let msg = input.val().trim();
    input.val('');
    console.log(msg);
    if (msg) {
      addMessage(msg);
    }
  });

  socket.on('request-name', () => {
    addMessage('ADDED TO GAME');
    // TODO: ask the player their name
    // also create player object
  });

  socket.on('rejected-from-room', () => {
    addMessage('GAME ROOM AT CAPACITY');
    setTimeout(() => { window.location = 'http://example.com' }, 5000);
  });

  let addMessage = (msg) => {
    messageOutput.append($('<li>').text(msg));
    messageOutput.parent().scrollTop(messageOutput.parent().height());
    input.focus();
  };

  input.focus();
});
