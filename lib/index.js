/* eslint no-use-before-define: 'off' */

import * as Loader from './loader.js';
import * as Game from './game.js';

const Key = [
  /* UP */ 'ArrowUp',
  /* RT */ 'ArrowRight',
  /* DN */ 'ArrowDown',
  /* LT */ 'ArrowLeft',
];

const NoDirection = -1;

function create() {
  /**
   * @type DbNone | DbLoading | DbPlaying
   */
  let db = { state: 'none' };

  /* Playing */

  /** @param {KeyboardEvent} evt */
  function onGameKey(evt) {
    if (db.state !== 'playing') throw new TypeError();

    /** @type DirElm | -1 */
    const direction = (Key.indexOf(evt.key)); // eslint-disable-line no-extra-parens
    if (direction !== NoDirection) db.pc.nextDirection = direction;
  }

  function onGameUpdate() {
    if (db.state !== 'playing') throw new TypeError();
    db = Game.onGameUpdate(db);
    db.stage.update();
  }

  /* Loading */

  /** @type {ErrorEventHandler} */
  function onLoadError(evt) {
    if (db.state !== 'loading') throw new TypeError();
    db = Loader.onLoadError(db, cb, evt);
    throw new Error('Loading error');
  }


  /** @type {EventListener} */
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
    onGameKey,
    onGameUpdate,
    onLoadError,
    onLoadDone,
    start,
  };

  return cb;
}


/**
 * Main entry point
 */
create().start();
