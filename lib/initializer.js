/* eslint-env browser */
/* global createjs */

import {SCALE, CELL_DIM, STAGE_W, STAGE_H} from './constants.js';

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

  const viewMaxX = (mainCanvas.width / SCALE) - (maze.image.width * maze.scaleX);
  const viewMaxY = (mainCanvas.height / SCALE) - (maze.image.height * maze.scaleY);

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = maze.image.width;
  tmpCanvas.height = maze.image.height;

  const ctx = tmpCanvas.getContext('2d');

  if (ctx === null) throw new TypeError('Cannot get canvas 2D context');

  ctx.drawImage(maze.image, 0, 0);

  const tickerHandle = createjs.Ticker.on('tick', cb.onPlayUpdate);
  createjs.Ticker.framerate = 60;
  createjs.Ticker.timingMode = createjs.Ticker.RAF;

  return { state: 'playing', mainCanvas, stage, maze, npc, viewMaxX, viewMaxY, ctx, tickerHandle };
}
