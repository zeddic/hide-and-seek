import {System} from 'ecsy';
import {Velocity, Position} from './position_component';

export class PhysicsSystem extends System {
  static queries = {
    movable: {components: [Position, Velocity]},
  };

  execute(delta: number, time: number) {
    // Euler implicit integration

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const v = entity.getComponent(Velocity);

      // Update velocity
      // obj.v.x += obj.a.x * delta;
      // obj.v.y += obj.a.y * delta;

      // Update position
      p.x += v.x * delta;
      p.y += v.y * delta;
    }
  }
}
