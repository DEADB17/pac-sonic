/* eslint-env browser */
/* global createjs */
/// <reference path="../node_modules/@types/createjs/index.d.ts" />

import {DB1, DB2, SCALE, CELL_DIM, STAGE_W, STAGE_H, Dir, OtherDir, OppositeDir} from './constants.js';

/**
 * @typedef {[boolean, boolean, boolean, boolean]} Surroundings
 */

/**
 * @arg {CanvasRenderingContext2D} ctx
 * @arg {Posn} npc
 * @return {Surroundings}
 */
function getSurroundings(ctx, npc) {
  const x = npc.x / CELL_DIM;
  const y = npc.y / CELL_DIM;
  return [
    /* UP */ ctx.getImageData(x, y - 1, 1, 1).data[0] === 255,
    /* RT */ ctx.getImageData(x + 1, y, 1, 1).data[0] === 255,
    /* DN */ ctx.getImageData(x, y + 1, 1, 1).data[0] === 255,
    /* LT */ ctx.getImageData(x - 1, y, 1, 1).data[0] === 255,
  ];
}

/**
 * @arg {Surroundings} surroundings
 * @arg {number} dir
 * @return {DirElm}
 */
function newDir(surroundings, dir) {
  const opts = surroundings[dir] ? OtherDir[OppositeDir[dir]] : OtherDir[dir];
  let alt = opts.filter(it => surroundings[it]);
  if (alt.length > 1) alt = alt.filter(it => it !== OppositeDir[dir]);
  return alt[Math.floor(Math.random() * alt.length)];
}

/**
 * @arg {Posn} npc
 * @arg {number} dir
 * @arg {number} step
 * @return {Posn}
 */
function move(npc, dir, step) {
  let {x, y} = npc;
  if (dir === Dir.UP) y -= step;
  else if (dir === Dir.RT) x += step;
  else if (dir === Dir.DN) y += step;
  else if (dir === Dir.LT) x -= step;
  return {x, y};
}

/**
 * @arg {number} offset
 * @arg {number} len
 * @arg {number} max
 * @return {number}
 */
function view(offset, len, max) {
  let sx;
  const dx = (len / (2 * SCALE)) - offset;
  if (dx > 0) sx = 0;
  else if (dx < max) sx = max * SCALE;
  else sx = dx * SCALE;
  return sx;
}

const step = 2;
let acc = CELL_DIM;

/** @type DirElm */
let dir = Dir.UP;

/** @type DirElm */
let dir2 = Dir.RT;

export function handleTick(db) {
  if (db.state !== DB2) throw new TypeError('Invalid db kind');

  if (acc === CELL_DIM) {
    acc = 0;

    const surroundings = getSurroundings(db.ctx, db.npc[0]);
    dir = newDir(surroundings, dir);

    const surroundings2 = getSurroundings(db.ctx, db.npc[1]);
    dir2 = newDir(surroundings2, dir2);
  }

  Object.assign(db.npc[0], move(db.npc[0], dir, step));

  Object.assign(db.npc[1], move(db.npc[1], dir2, step));

  acc += step;

  const npc = db.npc[0];
  db.stage.x = view(npc.x, db.mainCanvas.width, db.viewMaxX);
  db.stage.y = view(npc.y, db.mainCanvas.height, db.viewMaxY);
  db.stage.update();
}


/**
 * Initialization final step
 * @return {void}
 */
export function makeDbStage2(db) {
  db.state = DB2;
  if (db.state !== DB2) throw new TypeError('Invalid db kind');

  db.viewMaxX = (db.mainCanvas.width / SCALE) - (db.maze.image.width * db.maze.scaleX);
  db.viewMaxY = (db.mainCanvas.height / SCALE) - (db.maze.image.height * db.maze.scaleY);

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = db.maze.image.width;
  tmpCanvas.height = db.maze.image.height;

  const ctx = tmpCanvas.getContext('2d');

  if (ctx === null) throw new TypeError('Cannot get canvas 2D context');

  db.ctx = ctx;
  db.ctx.drawImage(db.maze.image, 0, 0, db.maze.image.width, db.maze.image.height);

  db.tickerHandle = createjs.Ticker.on('tick', handleTick);
}

/**
 * Initialization step 0
 * @return {Db1}
 */
export function makeDbStage1() {
  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = STAGE_W;
  mainCanvas.height = STAGE_H;
  document.body.appendChild(mainCanvas);

  const stage = new createjs.StageGL(mainCanvas);
  stage.scaleX = SCALE;
  stage.scaleY = SCALE;

  const maze = new createjs.Bitmap('maze.png');
  maze.scaleX = CELL_DIM;
  maze.scaleY = CELL_DIM;
  stage.addChild(maze);
  maze.image.onload = makeDbStage2;

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

  return { state: DB1, mainCanvas, stage, npc, maze };
}
