import * as PIXI from 'pixi.js';
import Stats from 'stats.js';

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
  private destroyed = false;

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
    const stage = new PIXI.Container();
    // const bounds = getBoundsOf(this.renderer.view);
    this.graphics = new PIXI.Graphics();
    // this.state = new GameState(bounds, stage, new Input());
    stage.addChild(this.graphics);
  }

  public destroy() {
    // todo: close network connections here
    this.renderer.destroy();
    this.destroyed = true;
  }

  public startGameLoop() {
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
        this.update(FIXED_UPDATE_STEP_MS / 1000);
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

  private render() {}
}

// function getBoundsOf(view: HTMLCanvasElement) {
//   return {left: 0, top: 0, right: view.width, bottom: view.height};
// }
