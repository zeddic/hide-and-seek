import * as ecsy from 'ecsy';
import {PhysicsSystem} from 'lancer-shared/lib/physics_system';
import {Position, Physics} from 'lancer-shared/lib/components';
import {WorldBoundsSystem} from 'lancer-shared/lib/world_bounds_system';
import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {ActionSystem} from './action_system';
import {NetworkSystem} from './network_system';
import {InputSystem} from './input_system';
import {LocalPlayerControlled} from './local_player_controlled';
import {PlayerControlSystem} from './player_control_system';
import {RenderSystem} from './render_system';
import {NetworkReconciliationSystem} from './network_reconciliation_system';
import {createGameLoader} from './resources';
import {Sprite} from './sprite';
import {SpriteResources} from './sprite_resources';
import {CollisionSystem} from 'lancer-shared/lib/collision/collision_system';
import {RemotePlayerControlled} from './remote_player_controlled';
import {TileMapSystem} from 'lancer-shared/lib/tiles/tile_map_system';
import {TileMapRenderSystem} from 'lancer-shared/lib/tiles/tile_map_render_system';
import {GameState, GameStage, Player} from 'lancer-shared';
import {
  TILE_MAP_BASE_OPTIONS,
  TILE_MAP_PALETTE,
} from 'lancer-shared/lib/constants';
import {RenderState} from './render_state';

/**
 * The number of milliseconds that should be simulated in each update
 * step within the game loop.
 */
const FIXED_UPDATE_STEP_MS = 1000 / 60;

/**
 * The maximum number of updates to perform per frame.
 */
const MAX_UPDATES_PER_TICK = 2;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/**
 * The game simulation run on the client.
 *
 * Note that the game run on the server is considered the source of truth.
 */
export class ClientGame {
  private stats: Stats;
  private renderState: RenderState;
  private destroyed = false;
  private world: ecsy.World;

  constructor(private readonly el: HTMLElement) {
    // Setup FPS stats
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.renderState = this.setupPIXI(el);
    this.world = new ecsy.World();
  }

  private setupPIXI(el: HTMLElement): RenderState {
    const renderer = new PIXI.Renderer({
      width: 1000,
      height: 800,
      antialias: false,
    });

    el.appendChild(renderer.view);

    const root = new PIXI.Container();
    const tilemap = new PIXI.Container();
    root.addChild(tilemap);

    return {renderer, root, tilemap};
  }

  public destroy() {
    // todo: close network connections here
    this.renderState.renderer.destroy();
    this.destroyed = true;
  }

  public setup() {
    const loader = createGameLoader();
    loader.load(() => {
      this.world
        .registerComponent(GameState)
        .registerComponent(Player)
        .registerComponent(Position)
        .registerComponent(Physics)
        .registerComponent(LocalPlayerControlled)
        .registerComponent(RemotePlayerControlled)
        .registerComponent(Sprite)
        .registerComponent(SpriteResources)
        .registerSystem(TileMapSystem, {
          options: TILE_MAP_BASE_OPTIONS,
        })
        .registerSystem(InputSystem)
        .registerSystem(ActionSystem)
        .registerSystem(NetworkSystem)
        .registerSystem(NetworkReconciliationSystem)
        .registerSystem(PlayerControlSystem)
        .registerSystem(PhysicsSystem)
        .registerSystem(CollisionSystem)
        .registerSystem(WorldBoundsSystem)
        .registerSystem(TileMapRenderSystem, {
          container: this.renderState.tilemap,
          palette: TILE_MAP_PALETTE,
          loader,
        })
        .registerSystem(RenderSystem, {
          renderState: this.renderState,
        });

      this.world
        .createEntity()
        .addComponent(GameState, {stage: GameStage.CONNECTING});

      this.startGameLoop();
    });
  }

  private startGameLoop() {
    let lastTimestamp = performance.now();
    let accumlator = 0;

    const step = () => {
      this.stats.begin();

      if (!this.destroyed) {
        requestAnimationFrame(step);
      }

      const now = performance.now();
      const delta = Math.min(now - lastTimestamp, 1000);
      accumlator += delta;

      let updates = 0;
      while (accumlator > FIXED_UPDATE_STEP_MS) {
        this.world.execute(FIXED_UPDATE_STEP_MS, FIXED_UPDATE_STEP_MS / 1000);
        accumlator -= FIXED_UPDATE_STEP_MS;
        updates++;

        if (updates >= MAX_UPDATES_PER_TICK) {
          accumlator = 0;
          break;
        }
      }

      this.renderState.renderer.render(this.renderState.root);
      lastTimestamp = now;
      this.stats.end();
    };

    requestAnimationFrame(step);
  }
}
