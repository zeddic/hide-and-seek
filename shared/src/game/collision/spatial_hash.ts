import {Region} from '../models/region';
import {getClosestExponentOfTwo} from '../util/math';
import {Entity} from 'ecsy';
import {Position} from '../components';

/**
 * Options for creating a new spaital hash.
 */
export interface SpatialHashOptions {
  /**
   * The desired size of a single cell.
   * For performance reasons this will be rounded down to the
   * closest number that is a power of 2 (eg 4, 8, 16, 32, 64, 128...)
   */
  gridSize?: number;
}

/**
 * A data structure that partitions a 2d space into a grid, tracks the position of
 * objects in that grid, and can be queried to find nearby objects.
 *
 * This uses a hash to encode an objects position and assign a reference to it
 * within grid cells that it covers. If an object spans multiple cells, all cells
 * will retain a reference to the object.
 */
export class SpatialHash {
  /**
   * The map of cells to objects within them.
   */
  public grid: {[key: string]: Entity[]} = {};

  /**
   * A map of objects that we know are in the hash to an encoded string
   * representing the set of cells we know they are in.
   */
  public objectToKeys = new WeakMap<Entity, string>();

  /**
   * A exponent of 2 that determines the size of the grid.
   * For example, a value of 6 represents a grid of size 64 (2^6 = 64)
   *
   * This value is used to bit-shift values in world space to quickly map them
   * to a cell within the grid. For example:
   *
   * 8 >> 6 = 0 (cell 0)
   * 64 >> 6 = 1 (cell 1)
   * 132 >> 6 = 2 (cell 2)
   */
  public exponentOfTwo: number;

  constructor(options: SpatialHashOptions) {
    this.exponentOfTwo = getClosestExponentOfTwo(options.gridSize || 64);
  }

  /**
   * Clears the
   */
  public clear() {
    this.grid = {};
    this.objectToKeys = new WeakMap<Entity, string>();
  }

  /**
   * Registers a new game object in the world.
   */
  public add(o: Entity) {
    const p = o.getComponent(Position);
    this.remove(o);

    const keys = this.getKeysForRegion(p);
    const cells: Entity[][] = [];

    for (const key of keys) {
      let cell = this.grid[key];
      if (!cell) {
        cell = [];
        this.grid[key] = cell;
      }
      cell.push(o);
      cells.push(cell);
    }

    this.objectToKeys.set(o, encodeKeys(keys));
  }

  /**
   * Removes an object from the grid.
   */
  public remove(o: Entity) {
    const keys = this.objectToKeys.get(o);
    if (!keys) return;

    for (const key of decodeKeys(keys)) {
      const cell = this.grid[key];
      if (cell) {
        const index = cell.indexOf(o);
        if (index >= 0) cell.splice(index, 1);
      }
    }
  }

  /**
   * Updates an objects location within the spatial hash after
   * it has been moved. This should be called after any movement has
   * been performed on the object.
   */
  public move(o: Entity) {
    const p = o.getComponent(Position);
    const keys = this.objectToKeys.get(o);
    if (!keys) {
      this.add(o);
      return;
    }

    const oldKeys = keys;
    const newKeys = encodeKeys(this.getKeysForRegion(p));

    if (oldKeys === newKeys) {
      return;
    }

    this.remove(o);
    this.add(o);
  }

  /**
   * Finds all objects that are potential collision candidates for
   * region. This includes all objects that are in any cell that this
   * region touches.
   */
  public query(region: Region) {
    const keys = this.getKeysForRegion(region);
    const objects: Entity[] = [];

    for (const key of keys) {
      const cell = this.grid[key];
      if (cell) {
        objects.push(...cell);
      }
    }

    return objects;
  }

  /**
   * Cleans up the data structure after a series of movements.
   */
  public cleanup() {
    // noop
  }

  /**
   * Given a region generates a set of keys for all cells it touches.
   */
  private getKeysForRegion(region: Region) {
    const sX = region.left >> this.exponentOfTwo;
    const sY = region.top >> this.exponentOfTwo;
    const eX = region.right >> this.exponentOfTwo;
    const eY = region.bottom >> this.exponentOfTwo;

    const keys: string[] = [];
    for (let y = sY; y <= eY; y++) {
      for (let x = sX; x <= eX; x++) {
        keys.push(x + ':' + y);
      }
    }

    return keys;
  }
}

function encodeKeys(keys: string[]) {
  return keys.join(';');
}

function decodeKeys(keys: string): string[] {
  return keys.split(';');
}
