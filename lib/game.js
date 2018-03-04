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
  const x = npc.x / CELL_DIM;
  const y = npc.y / CELL_DIM;
  return [
    /* UP */ grid[posToCell(gridWidth, x, y - 1)] === Cell.FLOOR,
    /* RT */ grid[posToCell(gridWidth, x + 1, y)] === Cell.FLOOR,
    /* DN */ grid[posToCell(gridWidth, x, y + 1)] === Cell.FLOOR,
    /* LT */ grid[posToCell(gridWidth, x - 1, y)] === Cell.FLOOR,
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

/**
 * @param {DbPlaying} db
 * @return {DbPlaying}
 */
export function onGameUpdate(db) {
  if (acc === CELL_DIM) {
    acc = 0;

    const surroundings = getSurroundings(db.gridWidth, db.grid, db.npc[0]);
    dir = newDir(surroundings, dir);

    const surroundings2 = getSurroundings(db.gridWidth, db.grid, db.npc[1]);
    dir2 = newDir(surroundings2, dir2);
  }

  Object.assign(db.npc[0], move(db.npc[0], dir, step));

  Object.assign(db.npc[1], move(db.npc[1], dir2, step));

  acc += step;

  const npc = db.npc[0];
  db.stage.x = view(npc.x, db.mainCanvas.width, db.viewMaxX);
  db.stage.y = view(npc.y, db.mainCanvas.height, db.viewMaxY);

  return db;
}
