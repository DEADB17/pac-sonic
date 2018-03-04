/* eslint-env browser */
/* global createjs */

import {SCALE, CELL_DIM, Cell, Dir} from './constants.js';
import {cellToX, cellToY} from './grid.js';

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @return {DbPlaying}
 */
export function play(db, cb) {
  /** @type Player */
  const pc = {
    sprite: new createjs.Bitmap(db.assets['sonic.png'].img),
    direction: Dir.RT,
    nextDirection: Dir.RT,
    velocity: 2,
    distance: CELL_DIM,
  };
  pc.sprite.x = CELL_DIM;
  pc.sprite.y = CELL_DIM;

  /** @type Character */
  const zombie = {
    sprite: new createjs.Bitmap(db.assets['zombie.png'].img),
    direction: Dir.UP,
    velocity: 2,
    distance: CELL_DIM,
  };
  zombie.sprite.x = CELL_DIM;
  zombie.sprite.y = 9 * CELL_DIM; // eslint-disable-line no-magic-numbers

  /** @type Character */
  const zombie2 = {
    sprite: zombie.sprite.clone(),
    direction: Dir.RT,
    velocity: 4,
    distance: CELL_DIM,
  };
  zombie2.sprite.x = 24 * CELL_DIM; // eslint-disable-line no-magic-numbers
  zombie2.sprite.y = CELL_DIM;

  const npc = [zombie, zombie2];

  const maze = new createjs.Bitmap(db.assets['maze.png'].img);
  maze.scaleX = CELL_DIM;
  maze.scaleY = CELL_DIM;

  const gridWidth = maze.image.width;
  const gridHeight = maze.image.height;

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = gridWidth;
  tmpCanvas.height = gridHeight;

  const ctx = tmpCanvas.getContext('2d');
  if (ctx === null) throw new TypeError('Cannot get canvas 2D context');

  ctx.drawImage(maze.image, 0, 0);

  const len = gridWidth * gridHeight;
  /** @type {number[]} */
  const grid = new Array(gridWidth * gridHeight);
  for (let cell = 0; cell < len; cell += 1) {
    const x = cellToX(gridWidth, cell);
    const y = cellToY(gridWidth, cell);
    // eslint-disable-next-line no-magic-numbers
    grid[cell] = ctx.getImageData(x, y, 1, 1).data[0] === 255 ? Cell.FLOOR : Cell.WALL;
  }

  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = 512;
  mainCanvas.height = 512;
  document.body.appendChild(mainCanvas);

  const viewMaxX = (mainCanvas.width / SCALE) - (gridWidth * maze.scaleX);
  const viewMaxY = (mainCanvas.height / SCALE) - (gridHeight * maze.scaleY);

  const stage = new createjs.StageGL(mainCanvas);
  stage.scaleX = SCALE;
  stage.scaleY = SCALE;

  stage.addChild(maze);
  stage.addChild(pc.sprite);
  npc.forEach(it => { stage.addChild(it.sprite); });
  // MAYBE(leo): stage.setClearColor('#000');

  document.addEventListener('keydown', cb.onGameKey);

  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  const tickerHandle = createjs.Ticker.on('tick', cb.onGameUpdate);

  return { state: 'playing', mainCanvas, stage, maze, pc, npc, viewMaxX, viewMaxY, grid, gridWidth, tickerHandle };
}
