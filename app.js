const express = require('express');
const socket = require('socket.io');

const app = express();

app.use(express.static('public'));

const server = app.listen(5000, () => {
  console.log('Server listening on port 5000');
});

let io = socket(server);

io.on('connection', (socket) => {
  console.log('made soecket connection');

  socket.on('beginPath', (data) => {
    io.emit('beginPath', data);
  });

  socket.on('drawStroke', (data) => {
    io.emit('drawStroke', data);
  });

  // socket.on('undoRedo', (data) => {
  //   io.emit('undoRedo', data);
  // });
  socket.on('undoRedo', (data) => {
    // Broadcast undoRedo to all clients except the one that triggered it
    socket.broadcast.emit('undoRedo', data);
  });
});
