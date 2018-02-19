/* eslint-env browser */
/* global createjs */
/// <reference path="../node_modules/@types/createjs/index.d.ts" />

import {CELL_DIM, STAGE_W, STAGE_H, Dir, OtherDir, OppositeDir} from './constants.js';


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
  res[Dir.UP] = ctx.getImageData(x, y - 1, 1, 1).data[0] === 255;
  res[Dir.RT] = ctx.getImageData(x + 1, y, 1, 1).data[0] === 255;
  res[Dir.DN] = ctx.getImageData(x, y + 1, 1, 1).data[0] === 255;
  res[Dir.LT] = ctx.getImageData(x - 1, y, 1, 1).data[0] === 255;
  return res;
}

const step = 2;
let acc = CELL_DIM;

/** @type DirElm */
let dir = Dir.UP;

/** @type DirElm */
let dir2 = Dir.RT;

function handleTick2() {
  if (acc === CELL_DIM) {
    acc = 0;

    const surroundings = getSurroundings(db.ctx, db.npc[0]);
    const opts = surroundings[dir] ? OtherDir[OppositeDir[dir]] : OtherDir[dir];
    let alt = opts.filter(it => surroundings[it]);
    if (alt.length > 1) alt = alt.filter(it => it !== OppositeDir[dir]);
    dir = alt[Math.floor(Math.random() * alt.length)];

    const surroundings2 = getSurroundings(db.ctx, db.npc[1]);
    const opts2 = surroundings2[dir2] ? OtherDir[OppositeDir[dir2]] : OtherDir[dir2];
    let alt2 = opts2.filter(it => surroundings2[it]);
    if (alt2.length > 1) alt2 = alt2.filter(it => it !== OppositeDir[dir2]);
    dir2 = alt2[Math.floor(Math.random() * alt2.length)];
  }

  if (dir === Dir.UP) db.npc[0].y -= step;
  else if (dir === Dir.RT) db.npc[0].x += step;
  else if (dir === Dir.DN) db.npc[0].y += step;
  else if (dir === Dir.LT) db.npc[0].x -= step;

  if (dir2 === Dir.UP) db.npc[1].y -= step;
  else if (dir2 === Dir.RT) db.npc[1].x += step;
  else if (dir2 === Dir.DN) db.npc[1].y += step;
  else if (dir2 === Dir.LT) db.npc[1].x -= step;

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
