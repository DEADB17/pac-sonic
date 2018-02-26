/* eslint-env browser */

import {Assets} from './constants.js';

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @param {object} evt
 * @return {void}
 */
export function onLoadError(db, cb, evt) {
  const imgKey = evt.target.dataset.key;
  const asset = db.assets[imgKey];
  if (asset !== undefined) asset.status = -1;
  console.error(asset);
}

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @param {object} evt
 * @return {boolean}
 */
export function onLoadDone(db, cb, evt) {
  const imgKey = evt.target.dataset.key;
  const asset = db.assets[imgKey];

  if (asset === undefined) throw new TypeError();

  asset.status = 1;

  return Object.keys(db.assets).every(it => db.assets[it].status === 1);
}

/**
 * @param {DbNone} db
 * @param {object} cb
 * @return {DbLoading}
 */
export function load(db, cb) {
  const assets = {};

  Assets.forEach(it => {
    const img = new Image();
    img.src = it;
    img.dataset.key = it;

    img.onerror = cb.onLoadError;
    img.onload = cb.onLoadDone;

    assets[it] = { status: 0, img };
  });

  return {
    state: 'loading',
    assets,
  };
}
