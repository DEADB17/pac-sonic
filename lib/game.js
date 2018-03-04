/* eslint-env browser */

import {SCALE, CELL_DIM, Cell, Dir, OtherDir, OppositeDir} from './constants.js';
import {posToCell} from './grid.js';

/**
 * @typedef {[boolean, boolean, boolean, boolean]} Surroundings
 */

/**
 * @arg {number} gridWidth
 * @arg {number[]} grid
 * @arg {Posn} npc
 * @return {Surroundings}
 */
function getSurroundings(gridWidth, grid, npc) {
  const x0 = npc.x / CELL_DIM;
  const y0 = npc.y / CELL_DIM;
  return [
    /* UP */ grid[posToCell(gridWidth, x0, y0 - 1)] === Cell.FLOOR,
    /* RT */ grid[posToCell(gridWidth, x0 + 1, y0)] === Cell.FLOOR,
    /* DN */ grid[posToCell(gridWidth, x0, y0 + 1)] === Cell.FLOOR,
    /* LT */ grid[posToCell(gridWidth, x0 - 1, y0)] === Cell.FLOOR,
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

const SCALE_2 = SCALE * 2;

/**
 * @arg {number} offset
 * @arg {number} len
 * @arg {number} max
 * @return {number}
 */
function view(offset, len, max) {
  let sx;
  const dx = (len / SCALE_2) - offset;
  if (dx > 0) sx = 0;
  else if (dx < max) sx = max * SCALE;
  else sx = dx * SCALE;
  return sx;
}

/**
 * @param {DbPlaying} db
 * @return {DbPlaying}
 */
export function onGameUpdate(db) {
  db.npc.forEach(npc => {
    const {distance, sprite, velocity} = npc;

    if (distance === CELL_DIM) {
      const surroundings = getSurroundings(db.gridWidth, db.grid, sprite);
      npc.direction = newDir(surroundings, npc.direction);
      npc.distance = 0;
    }

    const direction = npc.direction;
    if (direction === Dir.UP) sprite.y -= velocity;
    else if (direction === Dir.RT) sprite.x += velocity;
    else if (direction === Dir.DN) sprite.y += velocity;
    else if (direction === Dir.LT) sprite.x -= velocity;

    npc.distance += velocity;
  });

  const {x, y} = db.npc[0].sprite;
  const {width, height} = db.mainCanvas;
  db.stage.x = view(x, width, db.viewMaxX);
  db.stage.y = view(y, height, db.viewMaxY);

  return db;
}
