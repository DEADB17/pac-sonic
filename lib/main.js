/* eslint-env browser */
/* global createjs */
/// <reference path="../node_modules/@types/createjs/index.d.ts" />

////////////////////////////////////////////////////////////////////////////////
// constants

const CELLS_H = 40;
const CELLS_V = 32;

const CELL_DIM = 32;

const STAGE_W = CELL_DIM * CELLS_H; // 1280
const STAGE_H = CELL_DIM * CELLS_V; // 1024;

// directions
/** @typedef {Readonly<{ up: 0, rt: 1, dn: 2, lt: 3 }>} Dir */

/**
 * @type {Dir}
 */
const DIR = { up: 0, rt: 1, dn: 2, lt: 3 };

/** @typedef {Readonly<Dir['up'] | Dir['rt'] | Dir['dn'] | Dir['lt']>} DirElm */

/**
 * @type {Array<Readonly<Array<DirElm>>>}
 */
const DIR_OTHER = [];
DIR_OTHER[DIR.up] = [DIR.rt, DIR.dn, DIR.lt];
DIR_OTHER[DIR.rt] = [DIR.up, DIR.dn, DIR.lt];
DIR_OTHER[DIR.dn] = [DIR.up, DIR.rt, DIR.lt];
DIR_OTHER[DIR.lt] = [DIR.up, DIR.rt, DIR.dn];

/**
 * @type {Readonly<Array<DirElm>>}
 */
const DIR_OPPOSITE = [];
DIR_OPPOSITE[DIR.up] = DIR.dn;
DIR_OPPOSITE[DIR.rt] = DIR.lt;
DIR_OPPOSITE[DIR.dn] = DIR.up;
DIR_OPPOSITE[DIR.lt] = DIR.rt;


////////////////////////////////////////////////////////////////////////////////
// changing
/**
 * @typedef {object} Db0
 * @prop {HTMLCanvasElement} mainCanvas
 * @prop {createjs.StageGL} stage
 * @prop {createjs.Bitmap[]} npc
 * @prop {createjs.Bitmap} maze
 *
 * @typedef {object} Db
 * @prop {Db0['mainCanvas']} mainCanvas
 * @prop {Db0['stage']} stage
 * @prop {Db0['npc']} npc
 * @prop {Db0['maze']} maze
 * @prop {CanvasRenderingContext2D} ctx
 * @prop {function} tickerHandle
 */

/** @type Db0 | undefined */
let db0;

/** @type Db */
let db;


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
/** @type DirElm */
let dir = DIR.up;
/** @type DirElm */
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


/**
 * Initialization final step
 * @return {void}
 */
function completeDb() {
  if (db0 === undefined) throw new Error();

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = db0.maze.image.width;
  tmpCanvas.height = db0.maze.image.height;

  const ctx = tmpCanvas.getContext('2d');

  if (ctx === null) throw new Error();

  db = Object.assign(db0);
  db.ctx = ctx;
  db.ctx.drawImage(db.maze.image, 0, 0, db0.maze.image.width, db0.maze.image.height);

  db.tickerHandle = createjs.Ticker.on('tick', handleTick2);

  db0 = undefined;
}

/**
 * Initialization step 0
 * @return {void}
 */
function createDb0() {
  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = STAGE_W;
  mainCanvas.height = STAGE_H;
  document.body.appendChild(mainCanvas);

  const stage = new createjs.StageGL(mainCanvas);

  const maze = new createjs.Bitmap('maze.png');
  maze.scaleX = CELL_DIM;
  maze.scaleY = CELL_DIM;
  stage.addChild(maze);
  maze.image.onload = completeDb;

  const npc = [];

  const zombie = new createjs.Bitmap('zombie.png');
  zombie.x = 1 * CELL_DIM;
  zombie.y = 9 * CELL_DIM;
  npc.push(zombie);
  stage.addChild(zombie);

  const zombie2 = zombie.clone();
  zombie2.x = 24 * CELL_DIM;
  zombie2.y =  1 * CELL_DIM;
  npc.push(zombie2);
  stage.addChild(zombie2);

  db0 = { mainCanvas, stage, npc, maze };
}

createDb0();
