import {System, Component, Types} from 'ecsy';
import {InputState, Key} from './input_system';
import {
  Action,
  ActionsState,
  ActionActiveMap,
  KNOWN_ACTIONS,
} from 'lancer-shared/lib/game/actions';
import {ReplayState} from './replay_state';

export class ActionStateComponent extends Component<ActionStateComponent> {
  current: ActionsState = {id: -1, actions: {}};
  unconfirmed: ActionsState[] = [];
  lastConfirmedInput: number = -1;

  static schema = {
    current: {type: Types.Ref},
    queue: {type: Types.Ref},
    lastConfirmedInput: {type: Types.Number},
  };
}

/**
 * A system that consumes the raw input queue and converts it into a
 * queue of generic actions.
 *
 * For example: "W was pressed" => "Action: Move Left"
 */
export class ActionSystem extends System {
  static queries = {
    input: {
      components: [InputState],
    },
    action: {
      components: [ActionStateComponent],
    },
    replay: {
      components: [ReplayState],
    },
  };

  inputIdGen = 0;

  init() {
    this.world.registerComponent(ActionStateComponent, false);
    this.world.createEntity().addComponent(ActionStateComponent);
  }

  execute() {
    if (this.isReplaying()) {
      this.executeDuringReplay();
    } else {
      this.executeRegular();
    }
  }

  executeDuringReplay() {
    const replayState = this.getReplayState();
    const actionEntity = this.queries.action.results[0];
    const actionState = actionEntity.getMutableComponent(ActionStateComponent);

    const inputToReplay = actionState.unconfirmed[replayState.frameCount];
    actionState.current = inputToReplay || {};
  }

  executeRegular() {
    const inputEntity = this.queries.input.results[0];
    const inputState = inputEntity.getMutableComponent(InputState);

    const actionEntity = this.queries.action.results[0];
    const actionStateComponent = actionEntity.getMutableComponent(
      ActionStateComponent
    );

    const activeActions: ActionActiveMap = {}; // wasteful, new obj every frame

    for (const action of KNOWN_ACTIONS) {
      const keyBinding = KEY_BINDINGS.get(action);

      if (!keyBinding) {
        console.warn(`No key binding set for ${keyBinding}`);
        continue;
      }

      const activeWhilePressed = ACTIONS_TRIGGERED_WHILE_KEY_DOWN.has(action);

      const isActiveThisFrame = activeWhilePressed
        ? inputState.isPressed.has(keyBinding)
        : inputState.justPressed.has(keyBinding);

      // Skip saving 'false' to save on network overhead.
      if (isActiveThisFrame) activeActions[action] = true;
    }

    const input = {id: this.inputIdGen++, actions: activeActions};

    actionStateComponent.current = input;
    actionStateComponent.unconfirmed.push(input);
  }

  isReplaying() {
    return this.getReplayState().isReplaying;
  }

  getReplayState() {
    const replayEntity = this.queries.replay.results[0];
    return replayEntity.getComponent(ReplayState);
  }
}

/**
 * Keyboard bindings for each action.
 */
const KEY_BINDINGS = new Map<Action, Key>([
  [Action.LEFT, Key.A],
  [Action.UP, Key.W],
  [Action.DOWN, Key.S],
  [Action.RIGHT, Key.D],
  [Action.JUMP, Key.SPACE],
  [Action.HIDE, Key.Q],
]);

/**
 * Actions that fire every frame while the key-binding remains pressed.
 */
const ACTIONS_TRIGGERED_WHILE_KEY_DOWN = new Set<Action>([
  Action.LEFT,
  Action.RIGHT,
  Action.UP,
  Action.DOWN,
]);
