import {System} from 'ecsy';
import {Physics} from 'lancer-shared/lib/game/components';
import {LocalPlayerControlled} from './local_player_controlled';
import {ActionState} from './action_system';
import {ActionActiveMap} from 'lancer-shared/lib/game/actions';
import {PLAYER_SPEED} from 'lancer-shared/lib/game/constants';
import {RemotePlayerControlled} from './remote_player_controlled';

/**
 * A system that allows a local player to control an entity.
 */
export class PlayerControlSystem extends System {
  static queries = {
    player: {
      components: [LocalPlayerControlled, Physics],
    },
    others: {
      components: [RemotePlayerControlled, Physics],
    },
    actions: {
      components: [ActionState],
    },
  };

  execute() {
    this.updatePlayer();
    this.updateRemotePlayers();
  }

  updatePlayer(actions?: ActionActiveMap) {
    actions = actions || this.getCurrentActions();

    const entities = this.getLocalControlledEntities();
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

  updateRemotePlayers() {
    // Movement of other players is too chaotic to predict.
    // Assume their velocity is zero every turn and rely on
    // state updates.
    for (const entity of this.queries.others.results) {
      const movement = entity.getMutableComponent(Physics);
      movement.v.set(0, 0);
    }
  }

  getLocalControlledEntities() {
    return this.queries.player.results;
  }

  private getCurrentActions() {
    const actionsEntity = this.queries.actions.results[0];
    const actionState = actionsEntity.getComponent(ActionState);
    const actions = actionState.current.actions;
    return actions;
  }
}
