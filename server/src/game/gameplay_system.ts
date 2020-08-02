import {System, Entity} from 'ecsy';
import {
  GameState,
  GameStage,
  CountDown,
  Player,
  PlayerRole,
  randomInt,
  Collides,
} from 'lancer-shared';

/**
 * Implements the overall gameplay logic.
 */
export class GameplaySystem extends System {
  static queries = {
    gameState: {components: [GameState]},
    players: {components: [Player]},
  };

  countdown = new CountDown({duration: 11 * 1000});

  execute(delta: number) {
    const state = this.getGameState(true);

    if (state.stage === GameStage.COUNTING_DOWN) {
      this.executeCountingDown(delta);
    } else if (state.stage === GameStage.PLAYING) {
      this.executePlaying(delta);
    }
  }

  executeCountingDown(delta: number) {
    this.countdown.execute(delta);
    if (this.countdown.isJustDone()) {
      this.setGameStage(GameStage.PLAYING);
    }

    this.getGameState(true).countdown = this.countdown.value();
  }

  executePlaying(delta: number) {
    this.checkForSeekerCatchingHider();

    if (this.areAllHidersCaught()) {
      this.endGame();
    }
  }

  checkForSeekerCatchingHider() {
    const seeker = this.getSeeker();
    if (!seeker) return;

    const collides = seeker.getComponent(Collides);
    for (const other of collides.colliding.values()) {
      const p = other.getMutableComponent(Player);
      const collides = other.getMutableComponent(Collides);

      if (!p) continue;
      p.isCaptured = true;
      collides.disabled = true;
    }
  }

  setGameStage(stage: GameStage) {
    const state = this.getGameState(true);
    state.stage = stage;
  }

  startGame() {
    const players = this.queries.players.results;

    const newSeeker = players[randomInt(0, players.length)];
    for (const entity of players) {
      const player = entity.getMutableComponent(Player);
      player.isCaptured = false;
      player.role = entity === newSeeker ? PlayerRole.SEEKER : PlayerRole.HIDER;
    }

    this.countdown.reset();
    this.setGameStage(GameStage.COUNTING_DOWN);
  }

  endGame() {
    const players = this.queries.players.results;
    for (const entity of players) {
      const player = entity.getMutableComponent(Player);
      player.isCaptured = false;
      const collides = entity.getMutableComponent(Collides);
      collides.disabled = false;
    }

    this.setGameStage(GameStage.POST_GAME);
  }

  private areAllHidersCaught() {
    const players = this.queries.players.results;

    for (const entity of players) {
      const player = entity.getComponent(Player);

      if (player.role === PlayerRole.HIDER && !player.isCaptured) {
        return false;
      }
    }

    return true;
  }

  private getGameState(mutable = false): GameState {
    const e = this.queries.gameState.results[0];
    return mutable
      ? e.getMutableComponent(GameState)
      : e.getComponent(GameState);
  }

  private getSeeker(): Entity | undefined {
    const players = this.queries.players.results;
    for (const entity of players) {
      const player = entity.getComponent(Player);
      if (player.role === PlayerRole.SEEKER) {
        return entity;
      }
    }
    return undefined;
  }
}
