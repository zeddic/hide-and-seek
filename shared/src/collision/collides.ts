import {Component, Types, Entity} from 'ecsy';

/**
 * Identifies an object as being eligible for collision detection.
 */
export class Collides extends Component<Collides> {
  colliding = new Set<Entity>();

  static schema = {
    colliding: {type: Types.Ref},
  };
}
