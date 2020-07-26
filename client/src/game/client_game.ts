import * as ecsy from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {PhysicsSystem} from 'lancer-shared/lib/game/physics_system';
import {Position} from 'lancer-shared/lib/game/position_component';
import {WorldBoundsSystem} from 'lancer-shared/lib/game/world_bounds_system';
import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {ActionSystem} from './action_system';
import {NetworkSystem} from './network_system';
import {InputSystem} from './input_system';
import {LocalPlayerControlled} from './local_player_controlled';
import {LocalPlayerControlSystem} from './local_player_control_system';
import {RenderSystem} from './render_system';
import {NetworkReconciliationSystem} from './network_reconciliation_system';
import {createGameLoader} from './resources';
import {Sprite} from './sprite';
import {SpriteResources} from './sprite_resources';

/**
 * The number of milliseconds that should be simulated in each update
 * step within the game loop.
 */
const FIXED_UPDATE_STEP_MS = 1000 / 60;

/**
 * The maximum number of updates to perform per frame.
 */
const MAX_UPDATES_PER_TICK = 2;

/**
 * The game simulation run on the client.
 *
 * Note that the game run on the server is considered the source of truth.
 */
export class ClientGame {
  private stats: Stats;
  private graphics: PIXI.Graphics;
  private renderer: PIXI.Renderer;
  private stage: PIXI.Container;
  private destroyed = false;
  private world: ecsy.World;

  constructor(private readonly el: HTMLElement) {
    // Setup FPS stats
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    // Setup PIXI Renderer
    this.renderer = new PIXI.Renderer({
      width: 1000,
      height: 800,
    });
    document.body.appendChild(this.renderer.view);

    // State
    this.stage = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.stage.addChild(this.graphics);
    this.world = new ecsy.World();
  }

  public destroy() {
    // todo: close network connections here
    this.renderer.destroy();
    this.destroyed = true;
  }

  public setup() {
    const loader = createGameLoader();
    loader.load(() => {
      this.world
        .registerComponent(Position)
        .registerComponent(Movement)
        .registerComponent(LocalPlayerControlled)
        .registerComponent(Sprite)
        .registerComponent(SpriteResources)
        .registerSystem(InputSystem)
        .registerSystem(ActionSystem)
        .registerSystem(NetworkSystem)
        .registerSystem(NetworkReconciliationSystem)
        .registerSystem(LocalPlayerControlSystem)
        .registerSystem(PhysicsSystem)
        .registerSystem(WorldBoundsSystem)
        .registerSystem(RenderSystem, {
          graphics: this.graphics,
          stage: this.stage,
        });

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
        // this.update(FIXED_UPDATE_STEP_MS / 1000);
        this.world.execute(FIXED_UPDATE_STEP_MS, FIXED_UPDATE_STEP_MS / 1000);
        accumlator -= FIXED_UPDATE_STEP_MS;
        updates++;

        if (updates >= MAX_UPDATES_PER_TICK) {
          accumlator = 0;
          break;
        }
      }

      this.render();
      lastTimestamp = now;
      this.stats.end();
    };

    requestAnimationFrame(step);
  }

  private update(delta: number) {}

  private render() {
    this.renderer.render(this.stage);
  }
}
