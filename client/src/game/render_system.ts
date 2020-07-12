import {System, World, Attributes} from 'ecsy';
import {Position} from 'lancer-shared/lib/game/position_component';
import * as PIXI from 'pixi.js';

export class RenderSystem extends System {
  static queries = {
    movable: {components: [Position]},
  };

  private readonly graphics: PIXI.Graphics;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.graphics = attributes.graphics;
  }

  execute(delta: number, time: number) {
    this.graphics.clear();
    this.graphics.lineStyle(2, 0xff0000, 1);

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      // const v = entity.getComponent(Velocity);
      // console.log(p);
      this.graphics.drawCircle(p.x, p.y, 10);
    }
  }
}
