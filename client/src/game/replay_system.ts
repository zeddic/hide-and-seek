import {System} from 'ecsy';
import {ReplayState} from './replay_state';

export class ReplaySystem extends System {
  static queries = {
    state: {
      components: [ReplayState],
    },
  };

  init() {
    this.world.registerComponent(ReplayState, false);
    this.world.createEntity().addComponent(ReplayState);
  }

  execute() {
    const state = this.queries.state.results[0].getMutableComponent(
      ReplayState
    );

    if (state.isReplaying) {
      state.frameCount++;
    }
  }
}
