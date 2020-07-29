import {System, World, Attributes} from 'ecsy';
import {TileMapState} from './tile_map_state';
import * as PIXI from 'pixi.js';

/**
 * Settings that describe how a single tile should be rendered.
 */
export interface TileSwatch {
  resource?: string;
}

/**
 * A mapping of tile id to how it should be rendered.
 */
export interface TilePalette {
  [key: number]: TileSwatch;
}

/**
 * A system that can render a Tilemap.
 */
export class TileMapRenderSystem extends System {
  static queries = {
    state: {components: [TileMapState]},
  };

  private readonly graphics: PIXI.Graphics;
  private readonly tileToTexture = new Map<number, PIXI.Texture>();

  constructor(world: World, attributes: Attributes) {
    super(world);
    const container = attributes.container as PIXI.Container;

    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);

    const palette = attributes.palette as TilePalette;
    const loader = attributes.loader as PIXI.Loader;

    this.populateTextureMap(palette, loader);
  }

  /**
   * Scans the tile palette settings and grabs references to the textures
   * needed for each.
   */
  private populateTextureMap(palette: TilePalette, loader: PIXI.Loader) {
    for (const idStr in palette) {
      const id = Number(idStr);
      const swatch = palette[id];

      if (swatch.resource) {
        const resource = loader.resources[swatch.resource];
        if (!resource) {
          throw new Error(`${swatch.resource} not found for tile ${id}!`);
        }

        this.tileToTexture.set(id, resource.texture);
      }
    }
  }

  execute(delta: number) {
    const state = this.getTileMapState();
    const graphics = this.graphics;
    const tiles = state.map.tiles;
    const tileSize = state.map.tileSize;

    // Note: this is an inefficient way to draw the tilemap,
    // but it works for now so I'm not going to optimize it until
    // its a problem.

    graphics.clear();
    graphics.lineStyle(0);

    for (let row = 0; row < tiles.length; row++) {
      const rowTiles = tiles[row];
      for (let col = 0; col < rowTiles.length; col++) {
        const tileNum = rowTiles[col];
        const x = col * tileSize;
        const y = row * tileSize;
        const texture = this.tileToTexture.get(tileNum);
        if (texture) {
          graphics.beginTextureFill({texture});
          graphics.drawRect(x, y, tileSize, tileSize);
          graphics.endFill();
        }
      }
    }
  }

  private getTileMapState() {
    const entity = this.queries.state.results[0];
    return entity.getComponent(TileMapState);
  }
}
