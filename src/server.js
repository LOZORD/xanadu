/* Main server code */
let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/client.html`);
});

http.listen(3000, () => {
  console.log('listening on port 3000');
});

io.on('connection', (socket) => {
  socket.emit('request-name');
});
