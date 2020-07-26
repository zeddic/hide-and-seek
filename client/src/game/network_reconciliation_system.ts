import {System} from 'ecsy';
import {PhysicsSystem} from 'lancer-shared/lib/game/physics_system';
import {ActionState} from './action_system';
import {PlayerControlSystem} from './player_control_system';
import {NetworkState} from './network_state';
import {WorldBoundsSystem} from 'lancer-shared/lib/game/world_bounds_system';
import {CollisionSystem} from 'lancer-shared/lib/game/collision/collision_system';

/**
 * A system that reconciles local user input (which the client optimistically
 * applies) with inputs that the server has confirmed.
 *
 * Highlevel overview:
 *
 * - Every frame we capture user input and translate them to actions
 *   (eg move left)
 *
 * - Every frame we apply these actions to the client state and send them
 *   to the server.
 *
 * - At some point in the future, the server will provide a world state
 *   update and confirm the last input processed
 *
 * - To avoid snapping the player back to a stale position, we replay any
 *   uncofirmed input. This makes the input appear responsive even if
 *   there is high latency while we wait for all inputs to be confirmed.
 *
 * See https://gabrielgambetta.com/client-side-prediction-server-reconciliation.html
 */
export class NetworkReconciliationSystem extends System {
  static queries = {
    actions: {
      components: [ActionState],
    },
    network: {
      components: [NetworkState],
    },
  };

  execute(delta: number, time: number) {
    if (this.needToClearConfirmedActions()) {
      this.clearConfirmedActions();
      this.replayUnconfirmedActions(delta, time);
    }

    this.addCurrentActionToUnconfirmed();
  }

  /**
   * Drop any confirmed actions from our unconfirmed queue.
   */
  private clearConfirmedActions() {
    const state = this.getNetworkState();
    const unconfirmed = state.unconfirmedActions;

    while (
      unconfirmed.length > 0 &&
      unconfirmed[0].id <= state.lastConfirmedAction
    ) {
      unconfirmed.shift();
    }
  }

  /**
   * Returns true if of the unconfirmed actions in our queue have
   * been confirmed.
   */
  private needToClearConfirmedActions() {
    const state = this.getNetworkState();
    return (
      state.unconfirmedActions.length > 0 &&
      state.unconfirmedActions[0].id <= state.lastConfirmedAction
    );
  }

  /**
   * Replays any unconfirmed actions on player controlled entities.
   *
   * Note: This requires us to rerun a physics step for every unconfirmed
   * action.
   */
  private replayUnconfirmedActions(delta: number, time: number) {
    const state = this.getNetworkState();
    const unconfirmed = state.unconfirmedActions;
    if (unconfirmed.length === 0) {
      return;
    }

    if (unconfirmed.length > 2) {
      console.log(unconfirmed.length);
    }

    for (let i = 0; i < unconfirmed.length - 1; i++) {
      const playerControlSystem = this.world.getSystem(
        PlayerControlSystem
      ) as PlayerControlSystem;

      const physicsSystem = this.world.getSystem(
        PhysicsSystem
      ) as PhysicsSystem;

      const collisionSystem = this.world.getSystem(
        CollisionSystem
      ) as CollisionSystem;

      const worldBoundsSystem = this.world.getSystem(
        WorldBoundsSystem
      ) as WorldBoundsSystem;

      playerControlSystem.updatePlayer(unconfirmed[i].actions);
      const entitiesToUpdate = playerControlSystem.getLocalControlledEntities();

      physicsSystem.updateEntities(delta, time, entitiesToUpdate);

      collisionSystem.execute(delta);
      worldBoundsSystem.execute(delta, time);
    }
  }

  /**
   * Takes the action that was captured on the current frame and apends it
   * to the list of unconfirmed actions.
   */
  private addCurrentActionToUnconfirmed() {
    const state = this.getNetworkState();
    const actionsEntity = this.queries.actions.results[0];
    const actionState = actionsEntity.getComponent(ActionState);

    state.unconfirmedActions.push(actionState.current);
  }

  private getNetworkState(): NetworkState {
    return this.queries.network.results[0].getMutableComponent(NetworkState);
  }
}
