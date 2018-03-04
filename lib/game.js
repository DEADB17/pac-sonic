/* eslint-env browser */

import {SCALE, CELL_DIM, Cell, Dir, OtherDir, OppositeDir} from './constants.js';
import {posToCell} from './grid.js';

/**
 * @typedef {[boolean, boolean, boolean, boolean]} Surroundings
 */

/**
 * @arg {number} gridWidth
 * @arg {number[]} grid
 * @arg {number} x
 * @arg {number} y
 * @return {Surroundings}
 */
function getSurroundings(gridWidth, grid, x, y) {
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
  if (alt.length === 1) return alt[0];
  alt = alt.filter(it => it !== OppositeDir[dir]);
  return alt[Math.floor(Math.random() * alt.length)];
}

const SCALE_2 = SCALE * 2; // eslint-disable-line no-magic-numbers

/**
 * @arg {number} offset
 * @arg {number} len
 * @return {number}
 */
function view(offset, len) {
  return ((len / SCALE_2) - offset) * SCALE;
}

/**
 * @param {DbPlaying} db
 * @return {DbPlaying}
 */
export function onGameUpdate(db) {
  { // eslint-disable-line no-lone-blocks
    const pc = db.pc;

    const fn = pc.direction === Dir.UP || pc.direction === Dir.LT ? Math.ceil : Math.floor;
    const x = fn(pc.sprite.x / CELL_DIM);
    const y = fn(pc.sprite.y / CELL_DIM);
    const canGo = getSurroundings(db.gridWidth, db.grid, x, y);

    if (pc.direction !== pc.nextDirection) {
      const isModH = pc.sprite.x % CELL_DIM === 0;
      const isModV = pc.sprite.y % CELL_DIM === 0;

      if ((pc.nextDirection === Dir.UP && isModH && canGo[Dir.UP]) ||
          (pc.nextDirection === Dir.RT && isModV && canGo[Dir.RT]) ||
          (pc.nextDirection === Dir.DN && isModH && canGo[Dir.DN]) ||
          (pc.nextDirection === Dir.LT && isModV && canGo[Dir.LT])) {
        pc.direction = pc.nextDirection;
      }
    }

    if ((pc.direction === Dir.UP && canGo[Dir.UP]) ||
        (pc.direction === Dir.RT && canGo[Dir.RT]) ||
        (pc.direction === Dir.DN && canGo[Dir.DN]) ||
        (pc.direction === Dir.LT && canGo[Dir.LT])) {
      pc.distance = 0;
      pc.velocity = 2;
    } else {
      pc.distance = 32;
      pc.velocity = 0;
    }

    if (pc.velocity > 0) {
      const {sprite} = pc;
      if (pc.direction === Dir.UP) sprite.y -= pc.velocity;
      else if (pc.direction === Dir.RT) sprite.x += pc.velocity;
      else if (pc.direction === Dir.DN) sprite.y += pc.velocity;
      else if (pc.direction === Dir.LT) sprite.x -= pc.velocity;
      pc.distance += pc.velocity;
    }
  }


  db.npc.forEach(npc => {
    const {distance, sprite, velocity} = npc;

    if (distance === CELL_DIM) {
      const x = sprite.x / CELL_DIM;
      const y = sprite.y / CELL_DIM;
      const surroundings = getSurroundings(db.gridWidth, db.grid, x, y);
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


  const {x, y} = db.pc.sprite;
  const {width, height} = db.mainCanvas;
  db.stage.x = view(x, width);
  db.stage.y = view(y, height);

  return db;
}
