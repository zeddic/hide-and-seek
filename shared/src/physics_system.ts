import {System, Entity} from 'ecsy';
import {Physics} from './components/physics';
import {Position} from './components/position';

export class PhysicsSystem extends System {
  static queries = {
    movable: {components: [Position, Physics]},
  };

  execute(delta: number, time: number) {
    this.updateEntities(delta, time, this.queries.movable.results);
  }

  updateEntities(delta: number, time: number, entities: Entity[]) {
    // Euler implicit integration
    for (const entity of entities) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Physics);

      // Update velocity
      m.v.x += m.a.x * delta;
      m.v.y += m.a.y * delta;

      // Update position
      p.x += m.v.x * delta;
      p.y += m.v.y * delta;
    }
  }
}
