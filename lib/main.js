/* eslint-env browser */
/* global createjs */

////////////////////////////////////////////////////////////////////////////////
// constants

const CELLS_H = 40;
const CELLS_V = 32;

const CELL_DIM = 32;

const STAGE_W = CELL_DIM * CELLS_H; // 1280
const STAGE_H = CELL_DIM * CELLS_V; // 1024;

// directions
const DIR = { up: 0, rt: 1, dn: 2, lt: 3 };

const DIR_OTHER = [];
DIR_OTHER[DIR.up] = [DIR.rt, DIR.dn, DIR.lt];
DIR_OTHER[DIR.rt] = [DIR.up, DIR.dn, DIR.lt];
DIR_OTHER[DIR.dn] = [DIR.up, DIR.rt, DIR.lt];
DIR_OTHER[DIR.lt] = [DIR.up, DIR.rt, DIR.dn];

const DIR_OPPOSITE = [];
DIR_OPPOSITE[DIR.up] = DIR.dn;
DIR_OPPOSITE[DIR.rt] = DIR.lt;
DIR_OPPOSITE[DIR.dn] = DIR.up;
DIR_OPPOSITE[DIR.lt] = DIR.rt;


////////////////////////////////////////////////////////////////////////////////
// changing
const db = {
  mainCanvas: null,
  stage: null,
  npc: [],
  maze: null,
  ctx: null,
  tickerHandle: null,
};


////////////////////////////////////////////////////////////////////////////////
// functions
function getSurroundings(ctx, npc) {
  const x = npc.x / CELL_DIM;
  const y = npc.y / CELL_DIM;
  const res = [false, false, false, false];
  res[DIR.up] = ctx.getImageData(x, y - 1, 1, 1).data[0] === 255;
  res[DIR.rt] = ctx.getImageData(x + 1, y, 1, 1).data[0] === 255;
  res[DIR.dn] = ctx.getImageData(x, y + 1, 1, 1).data[0] === 255;
  res[DIR.lt] = ctx.getImageData(x - 1, y, 1, 1).data[0] === 255;
  return res;
}

const step = 2;
let acc = CELL_DIM;
let dir = DIR.up;
let dir2 = DIR.rt;

function handleTick2() {
  if (acc === CELL_DIM) {
    acc = 0;

    const surroundings = getSurroundings(db.ctx, db.npc[0]);
    let alt = surroundings[dir] ? DIR_OTHER[DIR_OPPOSITE[dir]] : DIR_OTHER[dir];
    alt = alt.filter(it => surroundings[it]);
    if (alt.length > 1) alt = alt.filter(it => it !== DIR_OPPOSITE[dir]);
    dir = alt[Math.floor(Math.random() * alt.length)];

    const surroundings2 = getSurroundings(db.ctx, db.npc[1]);
    let alt2 = surroundings2[dir2] ? DIR_OTHER[DIR_OPPOSITE[dir2]] : DIR_OTHER[dir2];
    alt2 = alt2.filter(it => surroundings2[it]);
    if (alt2.length > 1) alt2 = alt2.filter(it => it !== DIR_OPPOSITE[dir2]);
    dir2 = alt2[Math.floor(Math.random() * alt2.length)];
  }

  if (dir === DIR.up) db.npc[0].y -= step;
  else if (dir === DIR.rt) db.npc[0].x += step;
  else if (dir === DIR.dn) db.npc[0].y += step;
  else if (dir === DIR.lt) db.npc[0].x -= step;

  if (dir2 === DIR.up) db.npc[1].y -= step;
  else if (dir2 === DIR.rt) db.npc[1].x += step;
  else if (dir2 === DIR.dn) db.npc[1].y += step;
  else if (dir2 === DIR.lt) db.npc[1].x -= step;

  acc += step;

  db.stage.update();
}


////////////////////////////////////////////////////////////////////////////////
// init
createjs.Ticker.framerate = 60;
createjs.Ticker.timingMode = createjs.Ticker.RAF;

db.mainCanvas = document.createElement('canvas');
db.mainCanvas.width = STAGE_W;
db.mainCanvas.height = STAGE_H;
document.body.appendChild(db.mainCanvas);

db.stage = new createjs.StageGL(db.mainCanvas);

db.maze = new createjs.Bitmap('maze.png');
db.maze.scale = CELL_DIM;
db.stage.addChild(db.maze);
db.maze.image.onload = () => {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = db.maze.image.width;
  tmpCanvas.height = db.maze.image.height;
  db.ctx = tmpCanvas.getContext('2d');
  db.ctx.drawImage(db.maze.image, 0, 0, db.maze.image.width, db.maze.image.height);
  db.tickerHandle = createjs.Ticker.on('tick', handleTick2);
};

const zombie = new createjs.Bitmap('zombie.png');
zombie.x = 1 * CELL_DIM;
zombie.y = 9 * CELL_DIM;
db.npc.push(zombie);
db.stage.addChild(zombie);

const zombie2 = zombie.clone();
zombie2.x = 24 * CELL_DIM;
zombie2.y =  1 * CELL_DIM;
db.npc.push(zombie2);
db.stage.addChild(zombie2);
