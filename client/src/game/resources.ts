import * as PIXI from 'pixi.js';

export enum Image {
  SHIP = 'assets/ship.gif',
  TILE_FLOOR = 'assets/tile_floor.png',
  TILE_WALL = 'assets/tile_wall.png',
  DINO1 = 'assets/dino1.gif',
  DINO2 = 'assets/dino2.gif',
}

export let globalLoader: PIXI.Loader;

export function createGameLoader(): PIXI.Loader {
  const loader = new PIXI.Loader();

  const keys = Object.values(Image);

  for (const key of keys) {
    loader.add(key);
  }

  globalLoader = loader;
  return loader;
}

export function getLoader() {
  return globalLoader;
}
