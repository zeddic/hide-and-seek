/**
 * Utility functions associated with players.
 */

import {Player, PlayerRole} from './components';
import {
  SEEKER_SPEED,
  SEEKER_SNEEK_SPEED,
  HIDER_SPEED,
  HIDER_SNEEK_SPEED,
} from './constants';

/**
 * Returns the max speed allowed for the player in the current state.
 */
export function getPlayerSpeed(
  player: Player,
  options: {isSneeking: boolean} = {isSneeking: false}
) {
  if (player.role == PlayerRole.SEEKER) {
    return !options.isSneeking ? SEEKER_SPEED : SEEKER_SNEEK_SPEED;
  } else {
    return !options.isSneeking ? HIDER_SPEED : HIDER_SNEEK_SPEED;
  }
}
