import {System} from 'ecsy';
import {Movement} from './movement_component';
import {Position} from './position_component';

/**
 * A system that keeps items in the world bounds.
 *
 * For testing, currently bounces items off the edges.
 */
export class WorldBoundsSystem extends System {
  static queries = {
    movable: {components: [Position, Movement]},
  };

  execute(delta: number, time: number) {
    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Movement);

      if (p.x <= 0) {
        p.x = 0;
        m.v.x *= 0;
        m.a.x *= -1;
      }

      if (p.x >= 1000) {
        p.x = 1000;
        m.v.x *= 0;
        m.a.x *= -1;
      }

      if (p.y <= 0) {
        p.y = 0;
        m.v.y *= 0;
        m.a.y *= -1;
      }

      if (p.y >= 800) {
        p.y = 800;
        m.v.y *= 0;
        m.a.y *= -1;
      }
    }
  }
}