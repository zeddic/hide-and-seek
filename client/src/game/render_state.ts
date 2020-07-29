import * as PIXI from 'pixi.js';

/**
 * Contains references to global PIXI resources.
 */
export interface RenderState {
  /**
   * The global PIXI Renderer.
   */
  renderer: PIXI.Renderer;

  /**
   * A root container containing every else.
   */
  root: PIXI.Container;

  /**
   * A container that has the tilemap rendered within it.
   */
  tilemap: PIXI.Container;
}
