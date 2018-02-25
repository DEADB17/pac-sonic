/**
 * @type DbStage1
 */
const DB1 = 1;

/**
 * @type DbStage2
 */
const DB2 = 2;



const SCALE = 2;

const CELLS_H = 40;
const CELLS_V = 32;

const CELL_DIM = 32;

const STAGE_W = CELL_DIM * CELLS_H; // 1280
const STAGE_H = CELL_DIM * CELLS_V; // 1024;

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



export {DB1, DB2, SCALE, CELL_DIM, STAGE_W, STAGE_H, Dir, OtherDir, OppositeDir};
