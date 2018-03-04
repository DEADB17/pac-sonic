const Assets = ['maze.png', 'zombie.png' /*, 'sonic.png'*/];

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



export {Assets, SCALE, CELL_DIM, Cell, Dir, OtherDir, OppositeDir};
