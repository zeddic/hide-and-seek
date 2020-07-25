import {System, Entity} from 'ecsy';
import {Movement} from './movement_component';
import {Position} from './position_component';

export class PhysicsSystem extends System {
  static queries = {
    movable: {components: [Position, Movement]},
  };

  execute(delta: number, time: number) {
    this.updateEntities(delta, time, this.queries.movable.results);
  }

  updateEntities(delta: number, time: number, entities: Entity[]) {
    // Euler implicit integration
    for (const entity of entities) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Movement);

      // Update velocity
      m.v.x += m.a.x * delta;
      m.v.y += m.a.y * delta;

      // Update position
      p.x += m.v.x * delta;
      p.y += m.v.y * delta;
    }
  }
}
