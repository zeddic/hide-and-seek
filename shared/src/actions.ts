/**
 * Player actions in the game.
 */
export enum Action {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
  JUMP = 'jump',
  HIDE = 'hide',
  ADMIN_PRE_GAME = 'admin_pre_game',
  ADMIN_START = 'admin_start',
  ADMIN_PLAYING = 'admin_playing',
}

/**
 * A list of known actions.
 */
export const KNOWN_ACTIONS = Object.values(Action) as Action[];

/**
 * Captures the state of input actions as seen on a particular frame
 * on the client.
 */
export interface ActionSnapshot {
  /**
   * A unique id for this snapshot.
   */
  id: number;

  /**
   * The state of the actions when the snapshot was taken.
   */
  actions: ActionActiveMap;
}

/**
 * An object that maps a Action to whether it is active or not.
 *
 * Side note: This should really be a Set. However, its kept in this
 * form so it can be easily thrown over the socket w/o an extra
 * serialization step.
 */
export type ActionActiveMap = {
  [key in Action]?: boolean;
};
