import * as Loader from './loader.js';

export default function create() {
  /**
   * @type DbNone | DbLoading | DbPlaying
   */
  let db = { state: 'none' };

  let cb; // eslint-disable-line prefer-const

  /* Playing */

  function play() {
    db.state = 'playing';
  }

  /* Loading */

  function onLoadProgress(evt) {
    if (db.state !== 'loading') throw new TypeError();
    Loader.onLoadProgress(db, cb, evt);
  }

  function onLoadError(evt) {
    if (db.state !== 'loading') throw new TypeError();
    Loader.onLoadError(db, cb, evt);
  }

  function onLoadDone(evt) {
    if (db.state !== 'loading') throw new TypeError();
    Loader.onLoadDone(db, cb, evt);
  }

  function load() {
    if (db.state !== 'none') throw new TypeError();
    db = Loader.load(db, cb);
  }

  /* Callbacks */

  cb = {
    db,
    play,
    onLoadProgress,
    onLoadError,
    onLoadDone,
    load,
  };

  return cb;
}
