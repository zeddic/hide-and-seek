import {System} from 'ecsy';
import {Physics} from 'lancer-shared/lib/game/components';
import {LocalPlayerControlled} from './local_player_controlled';
import {ActionState} from './action_system';
import {ActionActiveMap} from 'lancer-shared/lib/game/actions';
import {PLAYER_SPEED} from 'lancer-shared/lib/game/constants';

/**
 * A system that allows a local player to control an entity.
 */
export class LocalPlayerControlSystem extends System {
  static queries = {
    player: {
      components: [LocalPlayerControlled, Physics],
    },
    actions: {
      components: [ActionState],
    },
  };

  execute() {
    const actionsEntity = this.queries.actions.results[0];
    const actionState = actionsEntity.getComponent(ActionState);
    const actions = actionState.current.actions;
    this.executeWithActions(actions);
  }

  executeWithActions(actions: ActionActiveMap) {
    const entities = this.getControlledEntities();
    for (const entity of entities) {
      const movement = entity.getMutableComponent(Physics);
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

  getControlledEntities() {
    return this.queries.player.results;
  }
}
