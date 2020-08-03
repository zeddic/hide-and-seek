/**
 * Utility functions associated with players.
 */
import {Player, PlayerRole, Physics} from './components';
import {
  SEEKER_SPEED,
  SEEKER_SNEEK_SPEED,
  HIDER_SPEED,
  HIDER_SNEEK_SPEED,
} from './constants';
import {ActionActiveMap} from './actions';
import {Entity} from 'ecsy';

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

/**
 * Given a set of user input, applies updates to the user entity.
 */
export function updatePlayerForActions(
  entity: Entity,
  actions: ActionActiveMap
) {
  const physics = entity.getMutableComponent(Physics);
  const player = entity.getComponent(Player);
  const isSneeking = !!actions.sneek;
  const speed = getPlayerSpeed(player, {isSneeking});

  physics.v.set(0, 0);

  if (actions.up) {
    physics.v.addValues(0, -speed);
  } else if (actions.down) {
    physics.v.addValues(0, speed);
  }

  if (actions.left) {
    physics.v.addValues(-speed, 0);
  } else if (actions.right) {
    physics.v.addValues(speed, 0);
  }

  // If the user moves <> and ^v at the same time the combined
  // speed will be greater than the max. Clamp the vector length.
  if (physics.v.lengthSq() > speed * speed) {
    physics.v.truncate(speed);
  }
}
