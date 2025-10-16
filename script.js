const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const scoreElement = document.getElementById('score');

const arenaWidth = 12;
const arenaHeight = 20;

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

const arena = createMatrix(arenaWidth, arenaHeight);

function createPiece(type) {
  switch (type) {
    case 'I': return [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ];
    case 'J': return [
      [2,0,0],
      [2,2,2],
      [0,0,0]
    ];
    case 'L': return [
      [0,0,3],
      [3,3,3],
      [0,0,0]
    ];
    case 'O': return [
      [4,4],
      [4,4]
    ];
    case 'S': return [
      [0,5,5],
      [5,5,0],
      [0,0,0]
    ];
    case 'T': return [
      [0,6,0],
      [6,6,6],
      [0,0,0]
    ];
    case 'Z': return [
      [7,7,0],
      [0,7,7],
      [0,0,0]
    ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = '#222';
        context.lineWidth = 0.05;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for(let y=0; y < m.length; y++) {
    for(let x=0; x < m[y].length; x++) {
      if(m[y][x] !== 0 &&
        (arena[y + o.y] &&
         arena[y + o.y][x + o.x]) !== 0) {
           return true;
         }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if(collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if(collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arenaWidth / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if(collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if(offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for(let y=0; y < matrix.length; y++) {
    for(let x=0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if(dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function arenaSweep() {
  let rowCount = 1;
  outer: for(let y=arena.length - 1; y >= 0; y--) {
    for(let x=0; x < arena[y].length; x++) {
      if(arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if(dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

function draw() {
  context.fillStyle = '#111';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function updateScore() {
  scoreElement.innerText = 'Score: ' + player.score;
}

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const player = {
  pos: {x:0, y:0},
  matrix: null,
  score: 0,
};

document.addEventListener('keydown', event => {
  if(event.key === 'ArrowLeft') {
    playerMove(-1);
  } else if(event.key === 'ArrowRight') {
    playerMove(1);
  } else if(event.key === 'ArrowDown') {
    playerDrop();
  } else if(event.key === 'q') {
    playerRotate(-1);
  } else if(event.key === 'w') {
    playerRotate(1);
  }
});
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value !== 0) {
        let grad = context.createLinearGradient(x+offset.x, y+offset.y, x+offset.x+1, y+offset.y+1);
        grad.addColorStop(0, colors[value]);
        grad.addColorStop(1, '#000000');
        context.fillStyle = grad;
        context.shadowColor = 'rgba(0,255,255,0.7)';
        context.shadowBlur = 10;
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.shadowBlur = 0;
        context.strokeStyle = '#222222cc';
        context.lineWidth = 0.1;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}
document.getElementById('left').addEventListener('touchstart', e => { playerMove(-1); e.preventDefault(); });
document.getElementById('right').addEventListener('touchstart', e => { playerMove(1); e.preventDefault(); });
document.getElementById('down').addEventListener('touchstart', e => { playerDrop(); e.preventDefault(); });
document.getElementById('rotateL').addEventListener('touchstart', e => { playerRotate(-1); e.preventDefault(); });
document.getElementById('rotateR').addEventListener('touchstart', e => { playerRotate(1); e.preventDefault(); });

// Optional: For desktop clicks too
const btns = [
  ['left', () => playerMove(-1)],
  ['right', () => playerMove(1)],
  ['down', () => playerDrop()],
  ['rotateL', () => playerRotate(-1)],
  ['rotateR', () => playerRotate(1)]
];
btns.forEach(([id, fn]) => {
  document.getElementById(id).addEventListener('click', fn);
});



playerReset();
updateScore();
update();

