import {Entity, System} from 'ecsy';
import {Physics, Position} from '../components';
import {Region} from '../models';
import {regionsCollide, seperateEntities} from './collisions';
import {SpatialHash} from './spatial_hash';

/**
 * Keeps track of the objects in the game world and resolves collisions.
 * May also be used to query the world for objects within a range.
 */
export class CollisionSystem extends System {
  static queries = {
    moveable: {
      components: [Position, Physics],
      listen: {added: true, removed: true},
    },
    moved: {
      components: [Position],
      listen: {changed: true},
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
    for (const entity of this.queries.moveable.results) {
      const p1 = entity.getComponent(Position);
      const others = this.query(p1);
      for (const other of others) {
        if (entity === other) {
          continue;
        }

        const p2 = other.getComponent(Position);

        if (regionsCollide(p1, p2)) {
          seperateEntities(entity, other);
        }
      }
    }

    for (const object of this.queries.moveable.results) {
      // todo: renable once tilemap system setup.
      // const tiles = this.world.tileMap.getSolidTileDetailsInRegion(object);
      // for (const tile of tiles) {
      //   if (regionsCollide(object, tile.region)) {
      //     sepearteGameObjectFromTile(object, tile);
      //   }
      // }
    }
  }

  query(region: Region): Entity[] {
    return this.spatialHash.query(region);
  }
}
