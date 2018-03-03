/* eslint-env browser */

import {Assets} from './constants.js';
import * as Init from './initializer.js';

/**
 * @param {DbLoading} db
 * @param {CallBacks} cb
 * @param {object} evt
 * @return {DbLoading}
 */
export function onLoadError(db, cb, evt) {
  const imgKey = evt.target.dataset.key;
  const asset = db.assets[imgKey];
  if (asset !== undefined) asset.status = -1;
  return db;
}

/**
 * @param {DbLoading} db
 * @param {CallBacks} cb
 * @param {object} evt
 * @return {DbLoading | DbPlaying}
 */
export function onLoadDone(db, cb, evt) {
  const imgKey = evt.target.dataset.key;
  const asset = db.assets[imgKey];

  if (asset === undefined) throw new TypeError();

  asset.status = 1;

  const isAllDone = Object.keys(db.assets).every(it => db.assets[it].status === 1);

  return isAllDone ? Init.play(db, cb) : db;
}

/**
 * @param {DbNone} db
 * @param {CallBacks} cb
 * @return {DbLoading}
 */
export function load(db, cb) {
  return {
    state: 'loading',
    assets: Assets.reduce((acc, it) => {
      const img = new Image();
      img.src = it;
      img.dataset.key = it;

      img.onerror = cb.onLoadError;
      img.onload = cb.onLoadDone;

      acc[it] = { status: 0, img };

      return acc;
    }, {}),
  };
}
