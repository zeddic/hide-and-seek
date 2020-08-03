import {System} from 'ecsy';
import {updatePlayerForActions} from 'lancer-shared';
import {ActionActiveMap} from 'lancer-shared/lib/actions';
import {Physics, Player} from 'lancer-shared/lib/components';
import {ActionState} from './action_system';
import {LocalPlayerControlled} from './local_player_controlled';
import {RemotePlayerControlled} from './remote_player_controlled';

/**
 * A system that allows a local player to control an entity.
 */
export class PlayerControlSystem extends System {
  static queries = {
    player: {
      components: [LocalPlayerControlled, Player, Physics],
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
      updatePlayerForActions(entity, actions);
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
