import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import * as ecsy from 'ecsy';
import {Position} from 'lancer-shared/lib/game/position_component';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {RenderSystem} from './render_system';
import {randomInt, randomValue} from 'lancer-shared/lib/util/random';
import {PhysicsSystem} from 'lancer-shared/lib/game/physics_system';
import {Vector} from 'lancer-shared/lib/util/vector';

/**
 * The number of milliseconds that should be simulated in each update
 * step within the game loop.
 */
const FIXED_UPDATE_STEP_MS = 1000 / 60;

/**
 * The maximum number of updates to perform per frame.
 */
const MAX_UPDATES_PER_TICK = 10;

export class Game {
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
    // const bounds = getBoundsOf(this.renderer.view);
    this.graphics = new PIXI.Graphics();
    // this.state = new GameState(bounds, stage, new Input());
    this.stage.addChild(this.graphics);

    this.world = new ecsy.World();
  }

  public destroy() {
    // todo: close network connections here
    this.renderer.destroy();
    this.destroyed = true;
  }

  public setup() {
    this.world
      .registerComponent(Position)
      .registerComponent(Movement)
      .registerSystem(PhysicsSystem)
      .registerSystem(RenderSystem, {graphics: this.graphics});

    for (let i = 0; i < 100; i++) {
      const a = new Vector(
        randomValue(-0.001, 0.001),
        randomValue(-0.001, 0.001)
      );
      const v = new Vector(randomValue(-0.1, 0.1), randomValue(-0.1, 0.1));
      // console.log(a);
      // console.log(v);
      this.world
        .createEntity()
        // .addComponent(Movement, {
        //   a: new Vector(randomValue(-1, 1), randomValue(-1, 1)),
        //   v: new Vector(randomValue(-1, 1), randomValue(-1, 1)),
        // })
        .addComponent(Movement, {
          a,
          v,
          x: randomInt(40, 200),
          y: randomInt(40, 200),
        })
        .addComponent(Position, {
          x: randomInt(40, 200),
          y: randomInt(40, 200),
        });
    }

    this.startGameLoop();
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
      while (
        accumlator > FIXED_UPDATE_STEP_MS &&
        updates < MAX_UPDATES_PER_TICK
      ) {
        // this.update(FIXED_UPDATE_STEP_MS / 1000);

        this.world.execute(FIXED_UPDATE_STEP_MS, FIXED_UPDATE_STEP_MS / 1000);

        accumlator -= FIXED_UPDATE_STEP_MS;
        updates++;
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

// function getBoundsOf(view: HTMLCanvasElement) {
//   return {left: 0, top: 0, right: view.width, bottom: view.height};
// }
