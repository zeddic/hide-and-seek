import {System} from 'ecsy';
import {RemotePlayerControlled} from './remote_player_controlled';
import {Physics, Player, PlayerRole, getPlayerSpeed} from 'lancer-shared';
import {HIDER_SPEED, SEEKER_SPEED} from 'lancer-shared/lib/constants';

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
      const player = entity.getComponent(Player);

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
        const isSneeking = !!actions.sneek;
        const speed = getPlayerSpeed(player, {isSneeking});

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

        remote.lastProcessedInput = actionsState.id;
      }
    }
  }
}
