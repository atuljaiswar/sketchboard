const menu = document.querySelector('.menu');
const toolContainer = document.querySelector('.toolContainer');
const header = document.querySelector('.header');
const pencilContainer = document.querySelector('.pencilContainer .pencilImg');
const pencilToolContainer = document.querySelector('.pencilToolContainer');
const eraserContainer = document.querySelector('.eraserContainer .eraserImg');
const eraserToolContainer = document.querySelector('.eraserToolContainer');
const upload = document.querySelector('.uploadContainer');
const stickyNote = document.querySelector('.stickyNote');
const undo = document.querySelector('.undo');
const redo = document.querySelector('.redo');
const body = document.querySelector('body');
let isEraserActive = false;
let color = 'red';
let isDragging = false; // Track whether dragging is active
let horizontalPositionRelativeToViewport = 0,
  verticalPositionRelativeToViewport = 0; // Store offset for smooth dragging
let currentDragElement = null;
let undoRedoTracker = [];
let track = 0;

const toolFlags = {
  isPencilToolVisible: false,
  isEraserToolVisible: false,
};

console.log({ body });
menu.addEventListener('click', () => {
  header.classList.toggle('show');
});

pencilContainer.addEventListener('click', () => {
  /*When to Use the Spread Operator:
Immutable Updates: In functional programming or libraries like React (especially for state management), you may need to avoid mutating objects directly. In such cases, the spread operator is helpful to ensure you don't mutate the original object.
When Replacing Multiple Properties: If you're updating many properties or merging objects, the spread operator can be useful.*/

  /*Why Reassigning Can Be an Extra Operation:
Memory Overhead: When you use the spread operator, a new object is created, and all properties from the original object are copied into the new object. This incurs extra memory allocation and copying, even if you're only changing one property.

Performance: For small objects, the performance impact is negligible. But as the size of the object grows (e.g., more properties or nested structures), reassigning the whole object can add unnecessary overhead.*/

  //   toolFlags = { ...toolFlags, isPencilToolVisible: true }
  toolFlags.isPencilToolVisible = !toolFlags?.isPencilToolVisible;
  if (toolFlags?.isPencilToolVisible) {
    pencilToolContainer.style.display = 'block';
  } else {
    pencilToolContainer.style.display = 'none';
  }
});

const addMouseDownEvent = (stickyNoteContainer) => {
  stickyNoteContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    currentDragElement = stickyNoteContainer;
    horizontalPositionRelativeToViewport =
      e.clientX - stickyNoteContainer.getBoundingClientRect().left;
    verticalPositionRelativeToViewport =
      e.clientY - stickyNoteContainer.getBoundingClientRect().top;
    // stickyNoteContainer.style.cursor = 'grabbing';
    console.log('mousedown');
  });
};

body.addEventListener('mousemove', (e) => {
  if (isDragging && currentDragElement) {
    const newX = e.clientX - horizontalPositionRelativeToViewport;
    const newY = e.clientY - verticalPositionRelativeToViewport;
    currentDragElement.style.left = `${newX}px`;
    currentDragElement.style.top = `${newY}px`;
  }
});

body.addEventListener('mouseup', (e) => {
  if (isDragging && currentDragElement) {
    isDragging = false; // Reset the dragging flag
    // currentDragElement.style.cursor = 'grab'; // Restore cursor style
    currentDragElement = null; // Clear the reference to the dragged element
  }
});

stickyNote.addEventListener('click', (e) => {
  generateStickyNoteContainer(false);
});

upload.addEventListener('click', (e) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.click();
  input.addEventListener('change', (e) => {
    const file = input.files[0];
    let imgUrl = URL.createObjectURL(file);
    generateStickyNoteContainer(true, imgUrl);
  });
});

const generateStickyNoteContainer = (isImage, imgUrl) => {
  const stickyNoteContainer = document.createElement('div');
  stickyNoteContainer.className = 'stickyContainer';
  stickyNoteContainer.draggable = true;
  stickyNoteContainer.innerHTML = `
  <div class="sticky-header">
    <span class="minimize">Minimize</span>
    <span class="remove">Remove</span>
  </div>
  <div class="stickyContent">
  </div>`;

  document.body.appendChild(stickyNoteContainer);

  const stickyContent = stickyNoteContainer.querySelector('.stickyContent');
  if (isImage) {
    stickyContent.innerHTML = `<img src=${imgUrl} />`;
  } else {
    stickyContent.innerHTML = '<textarea name="" id=""></textarea>';
  }

  addMouseDownEvent(stickyNoteContainer);

  const minimize = stickyNoteContainer.querySelector('.minimize');
  const remove = stickyNoteContainer.querySelector('.remove');
  notesContainer(minimize, remove, stickyNoteContainer);
};

const notesContainer = (minimize, remove, stickyContainer) => {
  remove.addEventListener('click', () => {
    console.log('CLICK');
    stickyContainer.remove();
  });

  minimize.addEventListener('click', () => {
    const stickyContent = stickyContainer.querySelector('.stickyContent');
    const display = getComputedStyle(stickyContent).getPropertyValue('display');
    if (display === 'block') {
      stickyContent.style.display = 'none';
    } else {
      stickyContent.style.display = 'block';
    }
  });
};
