import {System} from 'ecsy';
import {RemotePlayerComponent} from './remote_player_component';
import {Movement} from 'lancer-shared/lib/game/movement_component';

const PLAYER_SPEED = 200 / 1000;

/**
 * A system that allows a remote player to control an entity.
 */
export class RemotePlayerControlSystem extends System {
  static queries = {
    remote: {
      components: [RemotePlayerComponent, Movement],
    },
  };

  execute() {
    const entities = this.queries.remote.results;

    for (const entity of entities) {
      const remote = entity.getMutableComponent(RemotePlayerComponent)!;
      const movement = entity.getMutableComponent(Movement);
      movement.v.set(0, 0);

      // Only process at most 1 input per frame!
      // Each entry in the queue represents the state on the client at
      // single frame.
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

        remote.lastProcessedInput = actionsState.frame;
      }
    }
  }
}
