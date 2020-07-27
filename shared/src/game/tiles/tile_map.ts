import {Region} from '../models/region';
import {getClosestExponentOfTwo} from '../util/math';

/**
 * Configures how a single tile should act in the world.
 */
export interface TileConfig {
  isSolid: boolean;
}

/**
 * Maps a tile # to it's configuration.
 */
export interface TileConfigs {
  [key: number]: TileConfig;
}

export interface TileMapOptions {
  /**
   * The size per tile.
   * This must be a power of 2 (32, 64, 128, etc.)
   */
  tileSize: number;

  /**
   * The map of tiles. Each entry is a row, with the sub-array being columns.
   */
  map?: number[][];

  /**
   * Contains configuration details for each tile.
   */
  tileConfigs: TileConfigs;
}

/**
 * A datastructure that contains the tile map world information.
 */
export class TileMap {
  /**
   * The map.
   */
  tiles: number[][] = [];

  /**
   * The size of each tile.
   */
  tileSize: number;

  /**
   * The grid size expressed as an exponent of 2.
   * Used to bit-shift world units to quickly map them to tiles.
   * eg 5 => 2^5 => 32px by 32x
   */
  exponentOfTwo: number;

  /**
   * Tile definitions.
   */
  tileConfigs: TileConfigs;

  constructor(options: TileMapOptions) {
    this.tiles = options.map || [];
    this.tileSize = options.tileSize;
    this.exponentOfTwo = getClosestExponentOfTwo(options.tileSize);
    this.tileConfigs = options.tileConfigs;
  }

  public setMap(map: number[][]) {
    this.tiles = map;
  }

  public getSolidTileDetailsInRegion(region: Region) {
    const details = this.getTilesDetailsInRegion(region);
    return details.filter(d => d.solid);
  }

  public getTilesDetailsInRegion(region: Region) {
    const sCol = region.left >> this.exponentOfTwo;
    const sRow = region.top >> this.exponentOfTwo;
    const eCol = region.right >> this.exponentOfTwo;
    const eRow = region.bottom >> this.exponentOfTwo;

    const tiles: TileDetails[] = [];
    for (let col = sCol; col <= eCol; col++) {
      for (let row = sRow; row <= eRow; row++) {
        const tile = this.getTile(col, row);
        if (!tile) continue;

        const details: TileDetails = {
          region: this.tileToRegion(col, row),
          solid: this.isSolid(tile),
          solidFaces: {
            n: !this.isSolid(this.getAbove(col, row)),
            s: !this.isSolid(this.getBelow(col, row)),
            w: !this.isSolid(this.getLeft(col, row)),
            e: !this.isSolid(this.getRight(col, row)),
          },
        };

        tiles.push(details);
      }
    }

    return tiles;
  }

  /**
   * Seralizes internal state for saving.
   */
  public seralize(): SerializedTileMap {
    return {
      tiles: this.tiles,
      tileConfigs: this.tileConfigs,
      tileSize: this.tileSize,
    };
  }

  /**
   * Sets internal state from a serliazed tile map.
   */
  public deserialize(data: SerializedTileMap) {
    this.tiles = data.tiles;
    this.tileConfigs = data.tileConfigs;
    this.tileSize = data.tileSize;
  }

  private isSolid(id: number) {
    const config = this.tileConfigs[id];
    return !!config && config.isSolid;
  }

  private getTileAtXY(x: number, y: number) {
    const col = x >> this.exponentOfTwo;
    const row = y >> this.exponentOfTwo;
    return this.getTile(col, row);
  }

  private getTile(col: number, row: number): number {
    const tiles = this.tiles[row];
    return tiles && tiles[col];
  }

  private getAbove(col: number, row: number) {
    return this.getTile(col, row - 1);
  }

  private getBelow(col: number, row: number) {
    return this.getTile(col, row + 1);
  }

  private getLeft(col: number, row: number) {
    return this.getTile(col - 1, row);
  }
  private getRight(col: number, row: number) {
    return this.getTile(col + 1, row);
  }

  private convertRegion(region: Region): Region {
    return {
      top: region.top >> this.exponentOfTwo,
      left: region.left >> this.exponentOfTwo,
      bottom: region.bottom >> this.exponentOfTwo,
      right: region.right >> this.exponentOfTwo,
    };
  }

  private tileToRegion(col: number, row: number): Region {
    return {
      top: row << this.exponentOfTwo,
      left: col << this.exponentOfTwo,
      right: (col + 1) << this.exponentOfTwo,
      bottom: (row + 1) << this.exponentOfTwo,
    };
  }
}

/**
 * Metadata about a tile.
 */
export interface TileDetails {
  /** Its bounds. */
  region: Region;

  /**
   * Whether it is solid for collision.
   * Note that even if it is solid, only some faces of the square will be checked
   * for collision.
   */
  solid: boolean;

  /** What surfaces of the tile are considered solid. */
  solidFaces: {
    n: boolean;
    w: boolean;
    e: boolean;
    s: boolean;
  };
}

/**
 * A serialized form of the tilemap that can be sent over the network.
 */
export interface SerializedTileMap {
  tiles: number[][];
  tileSize: number;
  tileConfigs: TileConfigs;
}
