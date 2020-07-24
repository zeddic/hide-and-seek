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
}

/**
 * A list of known actions.
 */
export const KNOWN_ACTIONS = Object.values(Action) as Action[];

/**
 *
 */
export interface ActionsState {
  id: number;
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
