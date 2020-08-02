import {Entity, System, Not} from 'ecsy';
import {Physics, Position} from '../components';
import {Region} from '../models';
import {
  regionsCollide,
  seperateEntities,
  sepearteEntityFromTile,
} from './collisions';
import {SpatialHash} from './spatial_hash';
import {TileMapState} from '../tiles/tile_map_state';
import {Collides} from './collides';

/**
 * Keeps track of the objects in the game world and resolves collisions.
 * May also be used to query the world for objects within a range.
 */
export class CollisionSystem extends System {
  static queries = {
    moveable: {
      components: [Position, Physics, Collides],
      listen: {added: true, removed: true},
    },
    moved: {
      components: [Position, Physics, Collides],
      listen: {changed: true},
    },
    tiles: {
      components: [TileMapState],
    },
  };

  spatialHash = new SpatialHash({gridSize: 128});

  execute(delta: number) {
    this.handleAddedRemoved();
    this.handleMovement();
    this.resolveCollisions();
  }

  private handleAddedRemoved() {
    for (const entity of this.queries.moveable.added!) {
      this.spatialHash.add(entity);
    }

    for (const entity of this.queries.moveable.removed!) {
      this.spatialHash.remove(entity);
    }
  }

  private handleMovement() {
    for (const entity of this.queries.moveable.results) {
      this.spatialHash.move(entity);
    }
  }

  private resolveCollisions() {
    // Reset colliding state
    for (const entity of this.queries.moveable.results) {
      const c = entity.getMutableComponent(Collides);
      c.colliding.clear();
    }

    // Entity to Entity
    for (const entity of this.queries.moveable.results) {
      const p1 = entity.getComponent(Position);
      const c1 = entity.getMutableComponent(Collides);

      if (c1.disabled) {
        continue;
      }

      const others = this.query(p1);
      for (const other of others) {
        if (entity === other) {
          continue;
        }

        const p2 = other.getComponent(Position);
        const c2 = other.getComponent(Collides);

        if (c2.disabled) {
          continue;
        }

        if (regionsCollide(p1, p2)) {
          c1.colliding.add(other);
          c2.colliding.add(entity);
          seperateEntities(entity, other);
        }
      }
    }

    // Entity to Tile
    const tilesEntity = this.queries.tiles.results[0];
    const tileMapState = tilesEntity.getComponent(TileMapState);
    for (const entity of this.queries.moveable.results) {
      const p = entity.getComponent(Position);
      const tiles = tileMapState.map.getSolidTileDetailsInRegion(p);

      for (const tile of tiles) {
        if (regionsCollide(p, tile.region)) {
          sepearteEntityFromTile(entity, tile);
        }
      }
    }
  }

  query(region: Region): Entity[] {
    return this.spatialHash.query(region);
  }
}
