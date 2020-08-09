import {Entity, System} from 'ecsy';
import {
  GameStage,
  GameState,
  getPlayerSpeed,
  Physics,
  Player,
  Position,
} from 'lancer-shared';
import {Footprint} from './footprint';

const TIME_BETWEEN_FOOTPRINT_SPAWNS_MS = 1000;
const LIFE_OF_FOOTPRINT_MS = 2000;

/**
 * A system that spawns footprints behind players that are moving
 * too quickly.
 */
export class FootprintSystem extends System {
  static queries = {
    players: {components: [Position, Physics, Player]},
    footprints: {components: [Position, Footprint]},
    gameState: {components: [GameState]},
  };

  /**
   * Tracks the last time a foot print was spawned by each entity.
   */
  lastSpawnTimeByEntity = new WeakMap<Entity, number>();

  execute(delta: number, time: number) {
    // Spawn footprints when players move too quickly.
    for (const entity of this.queries.players.results) {
      if (
        this.isGameBeingPlayed() &&
        this.isMovingTooFast(entity) &&
        this.hasNotSpawnedFootprintRecently(entity)
      ) {
        this.spawnFootprint(entity);
      }
    }

    // Despawn footprints when they get too old.
    for (const entity of this.queries.footprints.results) {
      const footprint = entity.getMutableComponent(Footprint);
      footprint.life -= delta;
      if (footprint.life <= 0) {
        entity.remove();
      }
    }
  }

  isGameBeingPlayed(): boolean {
    const state = this.getGameState();
    return state.stage === GameStage.PLAYING;
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
    const sneekSpeed = getPlayerSpeed(player, {isSneeking: false});

    const maxSpeed = sneekSpeed * 1.01;
    const maxSpeedSq = maxSpeed * maxSpeed;

    return physics.v.lengthSq() >= maxSpeedSq;
  }

  private getGameState(): GameState {
    const e = this.queries.gameState.results[0];
    return e.getComponent(GameState);
  }
}
