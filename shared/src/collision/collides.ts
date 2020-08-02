import {Component, Types, Entity} from 'ecsy';

/**
 * Identifies an object as being eligible for collision detection.
 */
export class Collides extends Component<Collides> {
  colliding = new Set<Entity>();
  disabled = false;

  static schema = {
    colliding: {type: Types.Ref},
    disabled: {type: Types.Boolean},
  };
}
