/// <reference path="../node_modules/@types/createjs/index.d.ts" />

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

declare type Character = {
    sprite: createjs.Bitmap;
    direction: DirElm;
    velocity: number;
    distance: number,
}

type DbStateNone = 'none';
type DbStateLoading = 'loading';
type DbStatePlaying = 'playing';

declare type Db<T> = { state: T }

declare type DbNone = Db<DbStateNone>;

declare type DbLoading = Db<DbStateLoading> & {
    assets: {[x: string]: {status: number, img: HTMLImageElement}};
};

declare type DbPlaying = Db<DbStatePlaying> & {
    mainCanvas: HTMLCanvasElement;
    stage: createjs.StageGL;
    pc: Character;
    npc: Character[];
    maze: createjs.Bitmap;
    tickerHandle: Function;
    viewMaxX: number;
    viewMaxY: number;
    grid: number[];
    gridWidth: number;
}



interface Evt {type: string}
type EvtHandler = (evt: Evt) => void
declare type CallBacks = {
    db: DbNone | DbLoading | DbPlaying,
    onGameUpdate: () => void,
    onLoadError: EvtHandler,
    onLoadDone: EvtHandler,
    start: () => void
}