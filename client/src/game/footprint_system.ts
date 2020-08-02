import {System, Entity} from 'ecsy';
import {
  Player,
  Position,
  Physics,
  PlayerRole,
  SEEKER_SPEED,
  HIDER_SPEED,
} from 'lancer-shared';
import {Footprint} from './footprint';

const TIME_BETWEEN_FOOTPRINT_SPAWNS_MS = 500;
const LIFE_OF_FOOTPRINT_MS = 4000;

/**
 * A system that spawns footprints behind players that are moving
 * too quickly.
 */
export class FootprintSystem extends System {
  static queries = {
    players: {components: [Position, Physics, Player]},
    footprints: {components: [Position, Footprint]},
  };

  /**
   * Tracks the last time a foot print was spawned by each entity.
   */
  lastSpawnTimeByEntity = new WeakMap<Entity, number>();

  execute(delta: number, time: number) {
    // Spawn footprints when players move too quickly.
    for (const entity of this.queries.players.results) {
      if (
        this.isMovingTooFast(entity) &&
        this.hasNotSpawnedFootprintRecently(entity)
      ) {
        this.spawnFootprint(entity);
      }
    }

    // Despawn footprints when they get too old.
    for (const entity of this.queries.footprints.results) {
      const footprint = entity.getComponent(Footprint);
      footprint.life -= delta;
      if (footprint.life <= 0) {
        console.log('deswpan');
        entity.remove();
      }
    }
  }

  hasNotSpawnedFootprintRecently(entity: Entity) {
    const last = this.lastSpawnTimeByEntity.get(entity) || 0;
    const now = performance.now();
    return now - last >= TIME_BETWEEN_FOOTPRINT_SPAWNS_MS;
  }

  spawnFootprint(entity: Entity) {
    const now = performance.now();
    this.lastSpawnTimeByEntity.set(entity, now);

    const playerPosition = entity.getComponent(Position);

    this.world
      .createEntity()
      .addComponent(Footprint, {
        life: LIFE_OF_FOOTPRINT_MS,
        maxLife: LIFE_OF_FOOTPRINT_MS,
      })
      .addComponent(Position, {
        x: playerPosition.x,
        y: playerPosition.y,
      });
  }

  isMovingTooFast(entity: Entity) {
    const physics = entity.getComponent(Physics);
    const player = entity.getComponent(Player);
    const normalSpeed =
      player.role === PlayerRole.SEEKER ? SEEKER_SPEED : HIDER_SPEED;

    const maxSpeed = normalSpeed;
    const maxSpeedSq = maxSpeed * maxSpeed;

    return physics.v.lengthSq() >= maxSpeedSq;
  }
}
