/* eslint-env browser */
/* global createjs */
/// <reference path="../node_modules/@types/createjs/index.d.ts" />

import {DB1, DB2, CELL_DIM, STAGE_W, STAGE_H, Dir, OtherDir, OppositeDir} from './constants.js';


/** @type Db1 | Db2 */
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

function handleTick() {
  if (db.kind !== DB2) throw new TypeError('Invalid db kind');

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

  let sx;
  const dx = (db.mainCanvas.width / 2) - db.npc[0].x;
  const mx = db.mainCanvas.width - (db.maze.image.width * db.maze.scaleX);
  if (dx > 0) sx = 0;
  else if (dx < mx) sx = mx;
  else sx = dx;
  db.stage.x = sx;

  let sy;
  const dy = (db.mainCanvas.height / 2) - db.npc[0].y;
  const my = db.mainCanvas.height - (db.maze.image.height * db.maze.scaleY);
  if (dy > 0) sy = 0;
  else if (dy < my) sy = my;
  else sy = dy;
  db.stage.y = sy;

  db.stage.update();
}


/**
 * Initialization final step
 * @return {void}
 */
function makeDbStage2() {
  db.kind = DB2;
  if (db.kind !== DB2) throw new TypeError('Invalid db kind');

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
 * @return {void}
 */
function makeDbStage1() {
  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = STAGE_W / 2;
  mainCanvas.height = STAGE_H / 2;
  document.body.appendChild(mainCanvas);

  const stage = new createjs.StageGL(mainCanvas);

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

  db = { kind: DB1, mainCanvas, stage, npc, maze };
}

makeDbStage1();
