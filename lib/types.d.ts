type Up = 0;
type Rt = 1;
type Dn = 2;
type Lt = 3;

declare type DirElm = Up | Rt | Dn | Lt;

declare type OtherDirVec = [DirElm, DirElm, DirElm];



type DbStage1 = 1;
type DbStage2 = 2;

interface Db {
    mainCanvas: HTMLCanvasElement;
    stage: createjs.StageGL;
    npc: createjs.Bitmap[];
    maze: createjs.Bitmap;
}

declare interface Db1 extends Db {
    kind: DbStage1;
}

declare interface Db2 extends Db {
    kind: DbStage2;
    ctx: CanvasRenderingContext2D;
    tickerHandle: Function;
    viewMaxX: number;
    viewMaxY: number;
}
