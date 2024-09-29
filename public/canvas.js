const canvas = document.querySelector('canvas');
const downloadContainer = document.querySelector('.downloadContainer');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const drawTool = canvas.getContext('2d');
let strokeWidth = '';
let strokeColor = '';
let isMouseDown = false;
drawTool.strokeStyle = 'red';
const pencilWidth = pencilToolContainer.querySelector('input');
const eraserWidth = eraserToolContainer.querySelector('input');

const colorOptionContainer = document.querySelector(
  '.pencilToolContainer .colorOptionContainer'
);

colorOptionContainer.addEventListener('click', (e) => {
  console.log(e.target.classList[0]);
  strokeColor = `${e.target.classList[0]}`;
});

// Adjust the mouse coordinates relative to the canvas
const getMousePos = (canvas, event) => {
  const rect = canvas.getBoundingClientRect(); // Get canvas position
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

canvas.addEventListener('mousedown', (e) => {
  console.log('mousedown');
  isMouseDown = true;
  console.log({ pencilWidth });

  const obj = {
    clientX: e.clientX,
    clientY: e.clientY,
  };
  console.log({ obj });
  socket.emit('beginPath', obj);
});

const beginGraphicPath = (data) => {
  console.log('beginGraphicPath', data);
  const mousePos = getMousePos(canvas, data);
  drawTool.beginPath();
  drawTool.moveTo(mousePos.x, mousePos.y);
};

canvas.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    console.log('MOUSEMOVE');
    socket.emit('drawStroke', {
      clientX: e.clientX,
      clientY: e.clientY,
      strokeColor,
      strokeWidth,
    });
  }
});

const drawStroke = (data) => {
  const mousePos = getMousePos(canvas, data);
  drawTool.strokeStyle = data?.strokeColor;
  drawTool.lineWidth = data?.strokeWidth;
  drawTool.lineTo(mousePos.x, mousePos.y); // Draw to the correct position
  drawTool.stroke();
};

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  const url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

eraserContainer.addEventListener('click', () => {
  toolFlags.isEraserToolVisible = !toolFlags?.isEraserToolVisible;
  if (toolFlags?.isEraserToolVisible) {
    eraserToolContainer.style.display = 'block';
    strokeColor = '#fff';
    strokeWidth = eraserWidth.value;
  } else {
    strokeColor = 'red';
    strokeWidth = pencilWidth.value;
    eraserToolContainer.style.display = 'none';
  }
});

pencilWidth.addEventListener('change', (e) => {
  console.log('value', e.target.value);
  strokeWidth = e.target.value;
});

eraserWidth.addEventListener('change', (e) => {
  console.log('value', e.target.value);
  strokeWidth = e.target.value;
  strokeColor = '#fff';
});

downloadContainer.addEventListener('click', () => {
  const url = canvas.toDataURL();
  const a = document.createElement('a');
  a.href = url;
  a.download = 'board.jpg';
  a.click();
});

undo.addEventListener('click', () => {
  if (track > 0) track--;
  const data = {
    track,
    state: undoRedoTracker[track],
  };
  socket.emit('undoRedo', data);
});

redo.addEventListener('click', () => {
  if (track < undoRedoTracker.length - 1) track++;
  const data = {
    track,
    state: undoRedoTracker[track],
  };
  socket.emit('undoRedo', data);
});

const undoRedoCanvas = (data) => {
  track = data?.track;
  let url = data?.state;
  let img = new Image();
  img.src = url;
  drawTool.clearRect(0, 0, canvas.width, canvas.height);
  img.onload = (e) => {
    drawTool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
};

socket.on('beginPath', (data) => {
  beginGraphicPath(data);
});

socket.on('drawStroke', (data) => {
  drawStroke(data);
});

socket.on('undoRedo', (data) => {
  console.log('final', data);
  undoRedoCanvas(data);
});
