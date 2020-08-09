import {System, Component, Types} from 'ecsy';
import {InputState, Key} from './input_system';
import {
  Action,
  ActionSnapshot,
  ActionActiveMap,
  KNOWN_ACTIONS,
} from 'lancer-shared/lib/actions';

/**
 * Singleton state for the ActionSystem.
 */
export class ActionState extends Component<ActionState> {
  /**
   * The actions for the current frame.
   */
  current: ActionSnapshot = {id: -1, actions: {}};

  static schema = {
    current: {type: Types.Ref},
  };
}

/**
 * A system that consumes raw user input and converts it into actions the
 * user wishes to take on this frame.
 *
 * For example: "W pressed" => "Move Left"
 */
export class ActionSystem extends System {
  static queries = {
    input: {
      components: [InputState],
    },
    action: {
      components: [ActionState],
    },
  };

  /**
   * Used to generate a unique id for an action snapshot.
   */
  actionIdGen = 0;

  init() {
    this.world.createEntity().addComponent(ActionState);
  }

  execute() {
    const actionEntity = this.queries.action.results[0]!;
    actionEntity.getComponent(ActionState);
    const actionStateComponent = actionEntity.getMutableComponent(ActionState);

    actionStateComponent.current = this.createActionSnapshot();
  }

  /**
   * Creates a snapshot of the current actions the user has requested to
   * take for this frame based on user input.
   */
  private createActionSnapshot() {
    const inputEntity = this.queries.input.results[0];
    const inputState = inputEntity.getComponent(InputState);

    const activeActions: ActionActiveMap = {}; // wasteful, new obj every frame :(

    for (const action of KNOWN_ACTIONS) {
      const keyBinding = KEY_BINDINGS.get(action);

      if (!keyBinding) {
        console.warn(`No key binding set for ${action}`);
        continue;
      }

      const activeWhilePressed = ACTIONS_TRIGGERED_WHILE_KEY_DOWN.has(action);

      const isActiveThisFrame = activeWhilePressed
        ? inputState.isPressed.has(keyBinding)
        : inputState.justPressed.has(keyBinding);

      // Skip saving 'false' to save on network overhead.
      if (isActiveThisFrame) {
        activeActions[action] = true;
      }
    }

    const snapshot = {id: this.actionIdGen++, actions: activeActions};
    return snapshot;
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
  [Action.HIDE, Key.Q],
  [Action.JUMP, Key.K], // unused, remove
  [Action.SNEAK, Key.SPACE],
  [Action.ADMIN_PRE_GAME, Key.KEY_PAD_1],
  [Action.ADMIN_START, Key.KEY_PAD_2],
  [Action.ADMIN_PLAYING, Key.KEY_PAD_3],
]);

/**
 * Actions that fire every frame while the key-binding remains pressed.
 */
const ACTIONS_TRIGGERED_WHILE_KEY_DOWN = new Set<Action>([
  Action.LEFT,
  Action.RIGHT,
  Action.UP,
  Action.DOWN,
  Action.SNEAK,
]);
