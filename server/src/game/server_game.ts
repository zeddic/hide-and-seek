import {World} from 'ecsy';
import {Physics} from 'lancer-shared/lib/components/physics';
import {Position} from 'lancer-shared/lib/components/position';
import {PhysicsSystem} from 'lancer-shared/lib/physics_system';
import {WorldBoundsSystem} from 'lancer-shared/lib/world_bounds_system';
import {createFixedTimestepFn} from 'lancer-shared/lib/util/fixed_timestep';
import {performance} from 'perf_hooks';
import {RemotePlayerControlled} from './remote_player_controlled';
import {RemotePlayerControlSystem} from './remote_player_control_system';
import {ServerNetworkSystem} from './server_network_system';
import {CollisionSystem} from 'lancer-shared/lib/collision/collision_system';
import {TileMapSystem} from 'lancer-shared/lib/tiles/tile_map_system';
import {GameState, Player, Collides} from 'lancer-shared';
import {
  TILE_MAP_BASE_OPTIONS,
  TILE_MAP_LEVEL_1,
} from 'lancer-shared/lib/constants';
import {GameplaySystem} from './gameplay_system';

const UPDATES_PER_SECOND = 60;
const MS_PER_UPDATE = 1000 / UPDATES_PER_SECOND;
const MS_PER_CHECK = 1000 / (UPDATES_PER_SECOND * 2);
const TILE_MAP_OPTIONS = {
  ...TILE_MAP_BASE_OPTIONS,
  map: TILE_MAP_LEVEL_1,
};

/**
 * The game simulation run on the server.
 */
export class ServerGame {
  destroyed = false;
  world: World;

  constructor() {
    this.world = new World();
    this.world
      .registerComponent(GameState)
      .registerComponent(Collides, false)
      .registerComponent(Position)
      .registerComponent(Physics)
      .registerComponent(Player)
      .registerComponent(RemotePlayerControlled)
      .registerSystem(GameplaySystem)
      .registerSystem(TileMapSystem, {options: TILE_MAP_OPTIONS})
      .registerSystem(ServerNetworkSystem)
      .registerSystem(RemotePlayerControlSystem)
      .registerSystem(PhysicsSystem)
      .registerSystem(CollisionSystem)
      .registerSystem(WorldBoundsSystem);
  }

  setup() {
    // for (let i = 0; i < 1; i++) {
    //   const a = new Vector(
    //     randomValue(-0.001, 0.001),
    //     randomValue(-0.001, 0.001)
    //   );
    //   const v = new Vector(randomValue(-0.2, 0.2), randomValue(-0.2, 0.2));
    //   this.world
    //     .createEntity(String(i))
    //     .addComponent(Movement, {v})
    //     .addComponent(Position, {
    //       x: randomInt(40, 200),
    //       y: randomInt(40, 200),
    //     });
    // }

    this.world.createEntity().addComponent(GameState);

    this.startGameLoop();
  }

  private startGameLoop() {
    const fixedUpdatedFn = createFixedTimestepFn(
      MS_PER_UPDATE,
      (delta, time) => {
        this.world.execute(delta, time);
      }
    );

    let lastTimestamp = performance.now();
    const step = () => {
      if (!this.destroyed) {
        setTimeout(step, MS_PER_CHECK);
      }

      const now = performance.now();
      const delta = now - lastTimestamp;
      fixedUpdatedFn(delta, now);
      lastTimestamp = now;
    };

    setTimeout(step, MS_PER_CHECK);
  }

  destroy() {
    this.destroyed = true;
  }
}
