(function () {
  'use strict';

  const Assets = ['maze.png', 'zombie.png', 'sonic.png'];

  const SCALE = 2;

  const CELL_DIM = 32;

  const Cell = {FLOOR: 0, WALL: 1};

  /**
   * @type Readonly<{UP: Up; RT: Rt; DN: Dn; LT: Lt}>
   */
  const Dir = { UP: 0, RT: 1, DN: 2, LT: 3 };

  /**
   * @type [OtherDirVec, OtherDirVec, OtherDirVec, OtherDirVec]
   */
  const OtherDir = [
    /* UP */ [Dir.RT, Dir.DN, Dir.LT],
    /* RT */ [Dir.UP, Dir.DN, Dir.LT],
    /* DN */ [Dir.UP, Dir.RT, Dir.LT],
    /* LT */ [Dir.UP, Dir.RT, Dir.DN],
  ];

  /**
   * @type [Dn, Lt, Up, Rt]
   */
  const OppositeDir = [
    /* UP */ Dir.DN,
    /* RT */ Dir.LT,
    /* DN */ Dir.UP,
    /* LT */ Dir.RT,
  ];

  /**
   * @param {number} w Grid width
   * @param {number} x Grid column
   * @param {number} y Grid row
   * @return {number} Cell index
   */
  function posToCell(w, x, y) {
    return (w * y) + x;
  }

  /**
   * @param {number} w Grid width
   * @param {number} i Cell index
   * @return {number} Grid column
   */
  function cellToX(w, i) {
    return i % w;
  }

  /**
   * @param {number} w Grid width
   * @param {number} i Cell index
   * @return {number} Grid row
   */
  function cellToY(w, i) {
    return Math.floor(i / w);
  }

  /* eslint-env browser */

  /**
   * @param {DbLoading} db
   * @param {object} cb
   * @return {DbPlaying}
   */
  function play(db, cb) {
    /** @type Player */
    const pc = {
      sprite: new createjs.Bitmap(db.assets['sonic.png'].img),
      direction: Dir.RT,
      nextDirection: Dir.RT,
      velocity: 2,
      distance: CELL_DIM,
    };
    pc.sprite.x = CELL_DIM;
    pc.sprite.y = CELL_DIM;

    /** @type Character */
    const zombie = {
      sprite: new createjs.Bitmap(db.assets['zombie.png'].img),
      direction: Dir.UP,
      velocity: 2,
      distance: CELL_DIM,
    };
    zombie.sprite.x = CELL_DIM;
    zombie.sprite.y = 9 * CELL_DIM; // eslint-disable-line no-magic-numbers

    /** @type Character */
    const zombie2 = {
      sprite: zombie.sprite.clone(),
      direction: Dir.RT,
      velocity: 4,
      distance: CELL_DIM,
    };
    zombie2.sprite.x = 24 * CELL_DIM; // eslint-disable-line no-magic-numbers
    zombie2.sprite.y = CELL_DIM;

    const npc = [zombie, zombie2];

    const maze = new createjs.Bitmap(db.assets['maze.png'].img);
    maze.scaleX = CELL_DIM;
    maze.scaleY = CELL_DIM;

    const gridWidth = maze.image.width;
    const gridHeight = maze.image.height;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = gridWidth;
    tmpCanvas.height = gridHeight;

    const ctx = tmpCanvas.getContext('2d');
    if (ctx === null) throw new TypeError('Cannot get canvas 2D context');

    ctx.drawImage(maze.image, 0, 0);

    const len = gridWidth * gridHeight;
    /** @type {number[]} */
    const grid = new Array(gridWidth * gridHeight);
    for (let cell = 0; cell < len; cell += 1) {
      const x = cellToX(gridWidth, cell);
      const y = cellToY(gridWidth, cell);
      // eslint-disable-next-line no-magic-numbers
      grid[cell] = ctx.getImageData(x, y, 1, 1).data[0] === 255 ? Cell.FLOOR : Cell.WALL;
    }

    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = 512;
    mainCanvas.height = 512;
    document.body.appendChild(mainCanvas);

    const stage = new createjs.StageGL(mainCanvas);
    stage.scaleX = SCALE;
    stage.scaleY = SCALE;

    stage.addChild(maze);
    stage.addChild(pc.sprite);
    npc.forEach(it => { stage.addChild(it.sprite); });
    // @ts-ignore
    stage.setClearColor('#000');

    document.addEventListener('keydown', cb.onGameKey);

    createjs.Ticker.framerate = 60;
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    const tickerHandle = createjs.Ticker.on('tick', cb.onGameUpdate);

    return { state: 'playing', mainCanvas, stage, maze, pc, npc, grid, gridWidth, tickerHandle };
  }

  /* eslint-env browser */

  /**
   * @param {DbLoading} db
   * @param {CallBacks} cb
   * @param {object} evt
   * @return {DbLoading}
   */
  function onLoadError(db, cb, evt) {
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
  function onLoadDone(db, cb, evt) {
    const imgKey = evt.target.dataset.key;
    const asset = db.assets[imgKey];

    if (asset === undefined) throw new TypeError();

    asset.status = 1;

    const isAllDone = Object.keys(db.assets).every(it => db.assets[it].status === 1);

    return isAllDone ? play(db, cb) : db;
  }

  /**
   * @param {DbNone} db
   * @param {CallBacks} cb
   * @return {DbLoading}
   */
  function load(db, cb) {
    return {
      state: 'loading',
      assets: Assets.reduce(/** @param {{[x: string]}} acc*/(acc, it) => {
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

  /* eslint-env browser */

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
  function onGameUpdate(db) {
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

  /* eslint no-use-before-define: 'off' */

  const Key = [
    /* UP */ 'ArrowUp',
    /* RT */ 'ArrowRight',
    /* DN */ 'ArrowDown',
    /* LT */ 'ArrowLeft',
  ];

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
      if (direction !== -1) db.pc.nextDirection = direction; // eslint-disable-line no-magic-numbers
    }

    function onGameUpdate$$1() {
      if (db.state !== 'playing') throw new TypeError();
      db = onGameUpdate(db);
      db.stage.update();
    }

    /* Loading */

    /** @type {EventListener} */
    function onLoadError$$1(evt) {
      if (db.state !== 'loading') throw new TypeError();
      db = onLoadError(db, cb, evt);
      throw new Error('Loading error');
    }


    /** @type {EventListener} */
    function onLoadDone$$1(evt) {
      if (db.state !== 'loading') throw new TypeError();
      db = onLoadDone(db, cb, evt);
    }

    function start() {
      if (db.state !== 'none') throw new TypeError();
      db = load(db, cb);
    }

    /* Callbacks */

    /**
     * @type CallBacks
     */
    const cb = {
      db,
      onGameKey,
      onGameUpdate: onGameUpdate$$1,
      onLoadError: onLoadError$$1,
      onLoadDone: onLoadDone$$1,
      start,
    };

    return cb;
  }


  /**
   * Main entry point
   */
  create().start();

}());
