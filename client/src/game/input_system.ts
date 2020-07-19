import {System, Component, Types} from 'ecsy';

/**
 * A system that captures user input and stores it in a global state component.
 */
export class InputSystem extends System {
  private live: InputState = new InputState();
  private pending: InputState = new InputState();

  init() {
    this.world.registerComponent(InputState, false);
    const entity = this.world.createEntity().addComponent(InputState);
    this.live = entity.getMutableComponent(InputState);

    window.addEventListener('keyup', e => this.onKeyup(e));
    window.addEventListener('keydown', e => this.onKeydown(e));
  }

  execute() {
    copySet(this.pending.isPressed, this.live.isPressed);
    copySet(this.pending.justPressed, this.live.justPressed);

    this.pending.justPressed.clear();
  }

  private onKeyup(e: KeyboardEvent) {
    this.pending.isPressed.delete(e.keyCode);
  }

  private onKeydown(e: KeyboardEvent) {
    const alreadyPressed = this.pending.isPressed.has(e.keyCode);

    // Ignore keyboard repeats. We only want the initial up/down.
    if (alreadyPressed) return;

    this.pending.isPressed.add(e.keyCode);
    this.pending.justPressed.add(e.keyCode);
  }
}

/**
 * Updates the dest set so it matches the src set.
 */
function copySet<T>(src: Set<T>, dest: Set<T>) {
  dest.clear();
  for (const key of src) {
    dest.add(key);
  }
}

/**
 * A 'singleton' component that contains both the state of the keyboard and
 * a queue of input events to be processed.
 */
export class InputState extends Component<InputState> {
  isPressed = new Set<Key>();
  justPressed = new Set<Key>();
  // queue: InputEvent[] = [];

  static schema = {
    isPressed: {type: Types.Ref},
    queue: {type: Types.Ref},
  };
}

export enum Key {
  A = 65,
  D = 68,
  E = 69,
  J = 74,
  K = 75,
  Q = 81,
  S = 83,
  W = 87,
  Z = 90,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  SHIFT = 16,
  SPACE = 32,
  COMMAND = 91,
}
