import * as Loader from './loader.js';
import * as Init from './initializer.js';
import * as Game from './game.js';

export default function create() {
  /**
   * @type DbNone | DbLoading | DbPlaying
   */
  let db = { state: 'none' };

  let cb; // eslint-disable-line prefer-const

  /* Playing */

  function onPlayUpdate() {
    if (db.state !== 'playing') throw new TypeError();
    Game.onPlayUpdate(db);
  }

  function play() {
    if (db.state !== 'loading') throw new TypeError();
    db = Init.play(db, cb);
  }

  /* Loading */

  function onLoadError(evt) {
    if (db.state !== 'loading') throw new TypeError();
    Loader.onLoadError(db, cb, evt);
  }

  function onLoadDone(evt) {
    if (db.state !== 'loading') throw new TypeError();
    if (Loader.onLoadDone(db, cb, evt)) play();
  }

  function start() {
    if (db.state !== 'none') throw new TypeError();
    db = Loader.load(db, cb);
  }

  /* Callbacks */

  cb = {
    db,
    onPlayUpdate,
    play,
    onLoadError,
    onLoadDone,
    start,
  };

  return cb;
}
