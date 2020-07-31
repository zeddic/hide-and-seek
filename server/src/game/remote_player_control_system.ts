import {System} from 'ecsy';
import {RemotePlayerControlled} from './remote_player_controlled';
import {Physics} from 'lancer-shared/lib/components';
import {PLAYER_SPEED} from 'lancer-shared/lib/constants';

const MAX_INPUT_QUEUE_SIZE = 4;

/**
 * A system that allows a remote player to control an entity.
 */
export class RemotePlayerControlSystem extends System {
  static queries = {
    remote: {
      components: [RemotePlayerControlled, Physics],
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

      while (remote.inputQueue.length > MAX_INPUT_QUEUE_SIZE) {
        remote.inputQueue.shift(); // drop oldest first.
      }

      // todo: merge what common logic I can with the local_player_control_system.
      // Otherwise they are going to get out of sync. Especially needed as
      // controls chemes get more advanced.
      if (remote.inputQueue.length > 0) {
        const actionsState = remote.inputQueue.shift();
        const actions = actionsState.actions;

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

        remote.lastProcessedInput = actionsState.id;
      }
    }
  }
}
