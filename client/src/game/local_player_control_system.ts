import {System} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {LocalPlayerComponent} from './local_player_component';
import {ActionStateComponent} from './client_action_system';

const PLAYER_SPEED = 400 / 1000;

/**
 * A system that allows a remote player to control an entity.
 */
export class LocalPlayerControlSystem extends System {
  static queries = {
    player: {
      components: [LocalPlayerComponent, Movement],
    },
    actions: {
      components: [ActionStateComponent],
    },
  };

  execute() {
    const entities = this.queries.player.results;
    const actionsEntity = this.queries.actions.results[0];
    const actionState = actionsEntity.getComponent(ActionStateComponent);
    const actions = actionState.current.actions;
    for (const entity of entities) {
      // const remote = entity.getMutableComponent(LocalPlayerComponent)!;
      const movement = entity.getMutableComponent(Movement);
      movement.v.set(0, 0);

      if (actions.up) {
        movement.v.addValues(0, -PLAYER_SPEED);
      } else if (actions.down) {
        movement.v.addValues(0, PLAYER_SPEED);
      }

      if (actions.left) {
        movement.v.addValues(-PLAYER_SPEED, 0);
      } else if (actions.right) {
        movement.v.addValues(PLAYER_SPEED, 0);
      }
    }
  }
}
