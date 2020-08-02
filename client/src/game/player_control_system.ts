import {System} from 'ecsy';
import {Physics, Player, PlayerRole} from 'lancer-shared/lib/components';
import {LocalPlayerControlled} from './local_player_controlled';
import {ActionState} from './action_system';
import {ActionActiveMap} from 'lancer-shared/lib/actions';
import {SEEKER_SPEED, HIDER_SPEED} from 'lancer-shared/lib/constants';
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
      const movement = entity.getMutableComponent(Physics);
      const player = entity.getComponent(Player);
      const speed =
        player?.role === PlayerRole.SEEKER ? SEEKER_SPEED : HIDER_SPEED;

      movement.v.set(0, 0);

      if (actions.up) {
        movement.v.addValues(0, -speed);
      } else if (actions.down) {
        movement.v.addValues(0, speed);
      }

      if (actions.left) {
        movement.v.addValues(-speed, 0);
      } else if (actions.right) {
        movement.v.addValues(speed, 0);
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
