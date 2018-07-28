/* eslint no-use-before-define: 'off' */

import * as Loader from './loader.js';
import * as Game from './game.js';

const Key = [
  /* UP */ 'ArrowUp',
  /* RT */ 'ArrowRight',
  /* DN */ 'ArrowDown',
  /* LT */ 'ArrowLeft',
];

export default function create() {
  /**
   * @type DbNone | DbLoading | DbPlaying
   */
  let db = { state: 'none' };

  /* Playing */

  function onGameKey(evt) {
    if (db.state !== 'playing') throw new TypeError();

    /** @type DirElm | -1 */
    const direction = (Key.indexOf(evt.key)); // eslint-disable-line no-extra-parens
    if (direction !== -1) db.pc.nextDirection = direction; // eslint-disable-line no-magic-numbers
  }

  function onGameUpdate() {
    if (db.state !== 'playing') throw new TypeError();
    db = Game.onGameUpdate(db);
    db.stage.update();
  }

  /* Loading */

  function onLoadError(evt) {
    if (db.state !== 'loading') throw new TypeError();
    db = Loader.onLoadError(db, cb, evt);
    throw new Error('Loading error');
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
    onGameKey,
    onGameUpdate,
    onLoadError,
    onLoadDone,
    start,
  };

  return cb;
}