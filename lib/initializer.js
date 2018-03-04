/* eslint-env browser */
/* global createjs */

import {SCALE, CELL_DIM, STAGE_W, STAGE_H, Cell} from './constants.js';
import {cellToX, cellToY} from './grid.js';

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @return {DbPlaying}
 */
export function play(db, cb) {
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = STAGE_W;
  mainCanvas.height = STAGE_H;
  document.body.appendChild(mainCanvas);

  const stage = new createjs.StageGL(mainCanvas);
  stage.scaleX = SCALE;
  stage.scaleY = SCALE;

  const maze = new createjs.Bitmap(db.assets['maze.png'].img);
  maze.scaleX = CELL_DIM;
  maze.scaleY = CELL_DIM;
  stage.addChild(maze);

  const npc = [];

  const zombie = new createjs.Bitmap(db.assets['zombie.png'].img);
  zombie.x = 1 * CELL_DIM;
  zombie.y = 9 * CELL_DIM;
  npc.push(zombie);
  stage.addChild(zombie);

  const zombie2 = zombie.clone();
  zombie2.x = 24 * CELL_DIM;
  zombie2.y =  1 * CELL_DIM;
  npc.push(zombie2);
  stage.addChild(zombie2);

  const gridWidth = maze.image.width;
  const gridHeight = maze.image.height;

  const viewMaxX = (mainCanvas.width / SCALE) - (gridWidth * maze.scaleX);
  const viewMaxY = (mainCanvas.height / SCALE) - (gridHeight * maze.scaleY);

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
    grid[cell] = ctx.getImageData(x, y, 1, 1).data[0] === 255 ? Cell.FLOOR : Cell.WALL;
  }

  const tickerHandle = createjs.Ticker.on('tick', cb.onGameUpdate);
  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  return { state: 'playing', mainCanvas, stage, maze, npc, viewMaxX, viewMaxY, grid, gridWidth, tickerHandle };
}
