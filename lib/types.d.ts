type Up = 0;
type Rt = 1;
type Dn = 2;
type Lt = 3;

declare type DirElm = Up | Rt | Dn | Lt;

declare type OtherDirVec = [DirElm, DirElm, DirElm];



declare type Posn = {
    x: number;
    y: number;
}



type DbStateNone = 'none';
type DbStateLoading = 'loading';
type DbStatePlaying = 'playing';

declare type Db<T> = { state: T }

declare type DbNone = Db<DbStateNone>;

declare type DbLoading = Db<DbStateLoading> & {
    assets: Map<XMLHttpRequest, {status: number, result: undefined | Blob}>
};

declare type DbPlaying = Db<DbStatePlaying> & {
    mainCanvas: HTMLCanvasElement;
    stage: createjs.StageGL;
    npc: createjs.Bitmap[];
    maze: createjs.Bitmap;
    ctx: CanvasRenderingContext2D;
    tickerHandle: Function;
    viewMaxX: number;
    viewMaxY: number;
}
