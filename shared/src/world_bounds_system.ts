import {System} from 'ecsy';
import {Physics} from './components/physics';
import {Position} from './components/position';

/**
 * A system that keeps items in the world bounds.
 *
 * For testing, currently bounces items off the edges.
 */
export class WorldBoundsSystem extends System {
  static queries = {
    movable: {components: [Position, Physics]},
  };

  execute(delta: number, time: number) {
    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Physics);

      if (p.x < 0) {
        p.x = 0;
        m.v.x *= -1;
      }

      if (p.x > 1000) {
        p.x = 1000;
        m.v.x *= -1;
      }

      if (p.y < 0) {
        p.y = 0;
        m.v.y *= -1;
      }

      if (p.y > 800) {
        p.y = 800;
        m.v.y *= -1;
      }
    }
  }
}
