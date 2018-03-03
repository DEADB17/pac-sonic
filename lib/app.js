/* eslint no-use-before-define: 'off' */

import * as Loader from './loader.js';
import * as Game from './game.js';

export default function create() {
  /**
   * @type DbNone | DbLoading | DbPlaying
   */
  let db = { state: 'none' };

  /* Playing */

  function onGameUpdate() {
    if (db.state !== 'playing') throw new TypeError();
    db = Game.onGameUpdate(db);
    db.stage.update();
  }

  /* Loading */

  function onLoadError(evt) {
    if (db.state !== 'loading') throw new TypeError();
    db = Loader.onLoadError(db, cb, evt);
    console.error(db);
  }

  function onLoadDone(evt) {
    if (db.state !== 'loading') throw new TypeError();
    db = Loader.onLoadDone(db, cb, evt);
  }

  function start() {
    if (db.state !== 'none') throw new TypeError();
    db = Loader.load(db, cb);
  }

  /* Callbacks */

  /**
   * @type CallBacks
   */
  const cb = {
    db,
    onGameUpdate,
    onLoadError,
    onLoadDone,
    start,
  };

  return cb;
}
