import {System} from 'ecsy';
import {Physics, Player, updatePlayerForActions} from 'lancer-shared';
import {RemotePlayerControlled} from './remote_player_controlled';

const MAX_INPUT_QUEUE_SIZE = 4;

/**
 * A system that allows a remote player to control an entity.
 */
export class RemotePlayerControlSystem extends System {
  static queries = {
    remote: {
      components: [RemotePlayerControlled, Player, Physics],
    },
  };

  execute() {
    const entities = this.queries.remote.results;

    for (const entity of entities) {
      const remote = entity.getMutableComponent(RemotePlayerControlled)!;
      const movement = entity.getMutableComponent(Physics);
      movement.v.set(0, 0);

      // Only process at most 1 input per frame!
      // Each entry in the queue represents the state on the client at
      // single frame.
      // todo: squish the queue using OR.

      while (remote.inputQueue.length > MAX_INPUT_QUEUE_SIZE) {
        remote.inputQueue.shift(); // drop oldest first.
      }

      // todo: merge what common logic I can with the local_player_control_system.
      // Otherwise they are going to get out of sync. Especially needed as
      // controls chemes get more advanced.
      if (remote.inputQueue.length > 0) {
        const actionsState = remote.inputQueue.shift();
        const actions = actionsState.actions;
        updatePlayerForActions(entity, actions);
        remote.lastProcessedInput = actionsState.id;
      }
    }
  }
}
