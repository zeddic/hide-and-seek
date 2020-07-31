import {Attributes, Entity, System, World} from 'ecsy';
import {GameState, Player, PlayerRole, GameStage} from 'lancer-shared';
import {Physics} from 'lancer-shared/lib/components/physics';
import {Position} from 'lancer-shared/lib/components/position';
import {EntityUpdate} from 'lancer-shared/lib/messages';
import {TileMapSystem} from 'lancer-shared/lib/tiles/tile_map_system';
import {RemotePlayerControlled} from './remote_player_controlled';
import {
  OnConnectEvent,
  OnDisconnectEvent,
  OnPlayerActionEvent,
  SocketService,
} from './socket_service';

export class ServerNetworkSystem extends System {
  static queries = {
    movable: {components: [Position]},
    gameState: {components: [GameState]},
  };

  private readonly socketService: SocketService;
  private frame = 0;

  private playerEntityById = new Map<number, Entity>();

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.socketService = new SocketService();
  }

  init() {
    this.socketService.onConnect().subscribe(e => this.onConnect(e));
    this.socketService.onDisconnect().subscribe(e => this.onDisconnect(e));
    this.socketService.onPlayerAction().subscribe(e => this.onPlayerAction(e));
  }

  onConnect(e: OnConnectEvent) {
    // Create a player entity
    const playerId = e.player;
    const entity = this.world
      .createEntity(`player${playerId}`)
      .addComponent(Position, {x: 100, y: 100, width: 30, height: 30})
      .addComponent(Physics, {mass: 100})
      .addComponent(RemotePlayerControlled)
      .addComponent(Player, {
        id: playerId,
        name: `Player ${playerId}`,
        isCaptured: false,
        role: PlayerRole.UNASSIGNED,
      });

    this.playerEntityById.set(playerId, entity);

    // Send the connection a welcome package so it can initialze the game.
    const tileMap = this.world.getSystem(TileMapSystem) as TileMapSystem;
    this.socketService.sendInit(playerId, {
      playerId,
      entityId: entity.id, // todo: remove
      currentFrame: this.frame,
      initialState: this.getEntityUpdates(),
      tileMap: tileMap.serialize(),
    });
  }

  onDisconnect(e: OnDisconnectEvent) {
    const id = e.player;
    const entity = this.playerEntityById.get(id);
    entity.remove();
    this.playerEntityById.delete(id);
  }

  onPlayerAction(e: OnPlayerActionEvent) {
    const id = e.player;
    if (!this.playerEntityById.has(id)) return;

    this.processAdminInput(e);

    const player = this.playerEntityById.get(id);
    const remote = player.getMutableComponent(RemotePlayerControlled);
    remote.inputQueue.push(e.msg);
  }

  processAdminInput(e: OnPlayerActionEvent) {
    if (e.msg.actions.admin_playing) {
      this.getGameState(true).stage = GameStage.PLAYING;
    } else if (e.msg.actions.admin_pre_game) {
      this.getGameState(true).stage = GameStage.PRE_GAME;
    } else if (e.msg.actions.admin_start) {
      this.getGameState(true).stage = GameStage.COUNTING_DOWN;
      this.getGameState(true).countdown = 10 * 1000;
    }
  }

  execute(delta: number, time: number) {
    const gameState = this.getGameState();
    const updates = this.getEntityUpdates();

    for (const [playerId, entity] of this.playerEntityById.entries()) {
      const remote = entity.getComponent(RemotePlayerControlled);
      this.socketService.sendState(playerId, {
        frame: this.frame++,
        updates,
        lastProcessedInput: remote.lastProcessedInput,
        gameState: gameState.serialize(),
      });
    }
  }

  private getGameState(mutable = false): GameState {
    const e = this.queries.gameState.results[0];
    return mutable
      ? e.getMutableComponent(GameState)
      : e.getComponent(GameState);
  }

  private getEntityUpdates(): EntityUpdate[] {
    const updates: EntityUpdate[] = [];

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Physics);
      const player = entity.getComponent(Player);

      const update = {
        id: entity.id,
        x: p.x,
        y: p.y,
        w: p.width,
        h: p.height,
        v: {x: m.v.x, y: m.v.y},
        a: {x: m.a.x, y: m.a.y},
        m: m.mass,
        player,
      };

      updates.push(update);
    }

    return updates;
  }
}
