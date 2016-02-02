/* Main server code */
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');

app.use(express.static(path.join(__dirname, 'client')));

http.listen(3000, () => {
  console.log('listening on port 3000');
});

io.on('connection', (socket) => {
  socket.emit('request-name');
});
