/* eslint-env browser */

import {Assets} from './constants.js';

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @param {object} evt
 * @return {void}
 */
export function onLoadProgress(db, cb, evt) {
  const xhr = evt.target;
  const asset = db.assets.get(xhr);
  if (asset !== undefined) asset.status = evt.total / evt.loaded;
}

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @param {object} evt
 * @return {void}
 */
export function onLoadError(db, cb, evt) {
  const xhr = evt.target;
  const asset = db.assets.get(xhr);
  if (asset !== undefined) asset.status = -1;
  console.error(asset);
}

const XHR_STATUS_OK = 200;

/**
 * @param {DbLoading} db
 * @param {object} cb
 * @param {object} evt
 * @return {boolean}
 */
export function onLoadDone(db, cb, evt) {
  const xhr = evt.target;
  const asset = db.assets.get(xhr);

  if (asset === undefined) throw new TypeError();

  if (xhr.status === XHR_STATUS_OK) {
    asset.result = new Blob([xhr.response], {type: 'image/png'});
    return [...db.assets.values()].every(it => it.status === 1);
  } // else
  // throw new Error();
  return false;
}

/**
 * @param {DbNone} db
 * @param {object} cb
 * @return {DbLoading}
 */
export function load(db, cb) {
  const assets = new Map();

  Assets.forEach(it => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', it, true);
    xhr.responseType = 'blob';

    xhr.onprogress = cb.onLoadProgress;
    xhr.onerror = cb.onLoadError;
    xhr.onload = cb.onLoadDone;

    assets.set(xhr, { status: 0, result: undefined, key: it });

    xhr.send();
  });

  return {
    state: 'loading',
    assets,
  };
}
