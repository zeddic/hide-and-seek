import {Attributes, Entity, System, World} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {StateUpdateMessage, InitGameMessage} from 'lancer-shared/lib/messages';
import {ActionStateComponent} from './client_action_system';
import {ClientNetworkComponent} from './client_network_component';
import {ClientSocketService} from './client_socket_service';
import {LocalPlayerComponent} from './local_player_component';
import {ReplayState} from './replay_state';

/**
 * A system that recieves state syncs game state between the client and
 * server versions of the game.
 */
export class ClientNetworkSystem extends System {
  private readonly socketService: ClientSocketService;
  private readonly entitiesById = new Map<number, Entity>();
  private readonly seen = new Set<number>();
  private frame: number = -1;
  private lastUpdate?: StateUpdateMessage;

  static queries = {
    network: {
      components: [ClientNetworkComponent],
    },
    action: {
      components: [ActionStateComponent],
    },
    replay: {
      components: [ReplayState],
    },
  };

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.socketService = new ClientSocketService();
    this.socketService.onInitGame().subscribe(msg => this.onInitGame(msg));
    this.socketService
      .onStateUpdate()
      .subscribe(msg => this.onStateUpdate(msg));

    this.socketService.connect();
  }

  init() {
    this.world.registerComponent(ClientNetworkComponent, false);
    this.world.createEntity().addComponent(ClientNetworkComponent);
  }

  private onInitGame(msg: InitGameMessage) {
    this.frame = msg.currentFrame;
    this.createEntity(msg.entityId).addComponent(LocalPlayerComponent, {
      playerId: msg.playerId,
    });
  }

  private onStateUpdate(msg: StateUpdateMessage) {
    this.lastUpdate = msg;
  }

  private createEntity(id: number): Entity {
    const entity = this.world
      .createEntity()
      .addComponent(Position)
      .addComponent(Movement);

    this.entitiesById.set(id, entity);
    return entity;
  }

  execute(delta: number, time: number) {
    if (this.isReplaying()) {
      return;
    }

    this.processServerMessage(delta, time);
    this.sendUserInput();
  }

  processServerMessage(delta: number, time: number) {
    if (!this.lastUpdate) return;

    const msg = this.lastUpdate;
    this.lastUpdate = undefined;
    this.frame = msg.frame;

    this.seen.clear();
    for (const update of msg.updates) {
      const id = update.id;
      this.seen.add(id);

      const entity = this.entitiesById.has(id)
        ? this.entitiesById.get(id)
        : this.createEntity(id);

      const p = entity?.getMutableComponent(Position)!;
      const m = entity?.getMutableComponent(Movement)!;
      p.x = update.x;
      p.y = update.y;
      m.a.x = update.a.x;
      m.a.y = update.a.y;
      m.v.x = update.v.x;
      m.v.y = update.v.y;
    }

    // delete items that no longer exist on the server
    for (const [id, entity] of this.entitiesById.entries()) {
      if (!this.seen.has(id)) {
        entity.remove();
        this.entitiesById.delete(id);
      }
    }

    // todo: improve the update protocol.
    // Options:
    // (1) Always send everything. If something is new, create a new client
    //     entity. If something is missing, delete a client entity. For
    //     this games complexity, this may be simple and fast enough.
    // (2) Send deltas. Only items that change get sent. Would need seperate
    //     messages for adding/removing options.

    const actionEntity = this.queries.action.results[0];
    const actionState = actionEntity.getMutableComponent(ActionStateComponent);

    const lastConfirmed = msg.lastProcessedInput;
    if (
      lastConfirmed !== undefined &&
      actionState.lastConfirmedInput !== lastConfirmed
    ) {
      actionState.lastConfirmedInput = lastConfirmed;

      while (
        actionState.unconfirmed.length > 0 &&
        actionState.unconfirmed[0].id <= lastConfirmed
      ) {
        actionState.unconfirmed.shift();
      }

      const replayEntity = this.queries.replay.results[0];
      const replayState = replayEntity.getMutableComponent(ReplayState);

      if (actionState.unconfirmed.length > 1) {
        replayState.isReplaying = true;
        replayState.frameCount = 0;
        for (let i = 0; i < actionState.unconfirmed.length - 1; i++) {
          this.world.execute(delta, time);
        }

        replayState.isReplaying = false;
        actionState.current =
          actionState.unconfirmed[actionState.unconfirmed.length - 1];
      }
    }
  }

  sendUserInput() {
    const actionEntity = this.queries.action.results[0];
    const actionState = actionEntity.getMutableComponent(ActionStateComponent);
    const current = actionState.current;
    // if (Object.keys(current.actions).length > 0) {
    this.socketService.sendPlayerAction(current);
    // actionState.unconfirmed.push(current);
    // }
  }

  isReplaying() {
    const replayEntity = this.queries.replay.results[0];
    const replayState = replayEntity.getComponent(ReplayState);
    return replayState.isReplaying;
  }
}
