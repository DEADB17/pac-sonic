/* eslint-env browser */
/* global createjs */

const SPRITE_D = 32;
const STAGE_W = SPRITE_D * 40; // 1280
const STAGE_H = SPRITE_D * 32; // 1024;
const stage = new createjs.StageGL('View');

const zombie = new createjs.Bitmap('zombie.png');
const zombie2 = zombie.clone();
const maze = new createjs.Bitmap('maze.png');
maze.scale = SPRITE_D;

stage.addChild(maze);

stage.addChild(zombie);
zombie.x = 1 * SPRITE_D;
zombie.y = 9 * SPRITE_D;

stage.addChild(zombie2);
zombie2.x = 24 * SPRITE_D;
zombie2.y =  1 * SPRITE_D;

let hndl;
let ctx

const canvas = document.createElement('canvas');
maze.image.onload = ()=> {
  canvas.width = maze.image.width;
  canvas.height = maze.image.height;
  ctx = canvas.getContext('2d');
  ctx.drawImage(maze.image, 0, 0, maze.image.width, maze.image.height);
  hndl = createjs.Ticker.on('tick', handleTick2);
};

/* const n = 32;
 * const images = new Array(n);
 * for (let i = 0; i < n; i += 1) {
 *   images[i] = zombie.clone(false);
 *   images[i].y = i * 32;
 *   stage.addChild(images[i]);
 * }*/

createjs.Ticker.framerate = 60;
createjs.Ticker.timingMode = createjs.Ticker.RAF;

const DIR = { up: 0, rt: 1, dn: 2, lt: 3 };
const OTHER = [];
OTHER[DIR.up] = [DIR.rt, DIR.dn, DIR.lt];
OTHER[DIR.rt] = [DIR.up, DIR.dn, DIR.lt];
OTHER[DIR.dn] = [DIR.up, DIR.rt, DIR.lt];
OTHER[DIR.lt] = [DIR.up, DIR.rt, DIR.dn];
const OPPOSITE = [];
OPPOSITE[DIR.up] = DIR.dn;
OPPOSITE[DIR.rt] = DIR.lt;
OPPOSITE[DIR.dn] = DIR.up;
OPPOSITE[DIR.lt] = DIR.rt;

function getSurroundings(zom) {
  const x = (zom.x / 32);
  const y = (zom.y / 32);
  const res = [];
  res[DIR.up] = ctx.getImageData(x, y - 1, 1, 1).data[0] === 255;
  res[DIR.rt] = ctx.getImageData(x + 1, y, 1, 1).data[0] === 255;
  res[DIR.dn] = ctx.getImageData(x, y + 1, 1, 1).data[0] === 255;
  res[DIR.lt] = ctx.getImageData(x - 1, y, 1, 1).data[0] === 255;
  return res;
}

const step = 2;
let acc = SPRITE_D;
let dir = DIR.up;
let dir2 = DIR.rt;

function handleTick2(event) {
  if (acc === SPRITE_D) {
    acc = 0;

    let alt;
    const surroundings = getSurroundings(zombie);
    if (!surroundings[dir]) alt = OTHER[dir];
    else alt = OTHER[OPPOSITE[dir]];
    alt = alt.filter(it => surroundings[it]);
    if (alt.length > 1) alt = alt.filter(it => it !== OPPOSITE[dir]);
    dir = alt[Math.floor(Math.random() * alt.length)];

    let alt2;
    const surroundings2 = getSurroundings(zombie2);
    if (!surroundings2[dir2]) alt2 = OTHER[dir2];
    else alt2 = OTHER[OPPOSITE[dir2]];
    alt2 = alt2.filter(it => surroundings2[it]);
    if (alt2.length > 1) alt2 = alt2.filter(it => it !== OPPOSITE[dir2]);
    dir2 = alt2[Math.floor(Math.random() * alt2.length)];
  }

  if (dir === DIR.up) zombie.y -= step;
  else if (dir === DIR.rt) zombie.x += step;
  else if (dir === DIR.dn) zombie.y += step;
  else if (dir === DIR.lt) zombie.x -= step;

  if (dir2 === DIR.up) zombie2.y -= step;
  else if (dir2 === DIR.rt) zombie2.x += step;
  else if (dir2 === DIR.dn) zombie2.y += step;
  else if (dir2 === DIR.lt) zombie2.x -= step;

  acc += step;

  stage.update();
}

let off = -SPRITE_D;

function handleTick(event) {
  off += 4
  if (off > STAGE_W) off = -SPRITE_D;
  for (let i = 0; i < n; i += 1) {
    images[i].x = off;
  }
  stage.update();
}
