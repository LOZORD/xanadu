/* global io */
let socket = io('/debug');

$(document).ready(() => {
  let target = $('#debug');

  let render = (data) => {
    target.text(data);
  };

  // send 'get', get response
  let getData = () => {
    socket.emit('get', {});
    setTimeout(getData, 10000);
  };

  socket.on('debug-update', (data) => {
    render(data);
  });

  getData();
});
