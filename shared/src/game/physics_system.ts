import {System} from 'ecsy';
import {Movement} from './movement_component';
import {Position} from './position_component';

export class PhysicsSystem extends System {
  static queries = {
    movable: {components: [Position, Movement]},
  };

  execute(delta: number, time: number) {
    // Euler implicit integration

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Movement);

      // console.log(p);
      // if (!m.a) {
      //   // console.log(m);
      //   console.log('no');
      // }

      // Update velocity
      m.v.x += m.a.x * delta;
      m.v.y += m.a.y * delta;

      // Update position
      p.x += m.v.x * delta;
      p.y += m.v.y * delta;
    }
  }
}
