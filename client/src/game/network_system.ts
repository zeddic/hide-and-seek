import {Attributes, Entity, System, World} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {StateUpdateMessage, InitGameMessage} from 'lancer-shared/lib/messages';
import {ActionState, ActionSystem} from './action_system';
import {NetworkState} from './network_state';
import {ClientSocketService} from './client_socket_service';
import {LocalPlayerComponent} from './local_player_component';
import {NetworkReconciliationSystem} from './network_reconciliation_system';

/**
 * A system that recieves state syncs game state between the client and
 * server versions of the game.
 */
export class NetworkSystem extends System {
  private readonly socketService: ClientSocketService;
  private readonly entitiesById = new Map<number, Entity>();
  private readonly seen = new Set<number>();
  private frame: number = -1;
  private lastUpdate?: StateUpdateMessage;

  static queries = {
    network: {
      components: [NetworkState],
    },
    action: {
      components: [ActionState],
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
    this.world.registerComponent(NetworkState, false);
    this.world.createEntity().addComponent(NetworkState);
  }

  private onInitGame(msg: InitGameMessage) {
    this.getNetworkState().frame = msg.currentFrame;
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

  execute() {
    this.processServerMessage();
    this.sendUserInput();
  }

  processServerMessage() {
    if (!this.lastUpdate) {
      return;
    }

    const msg = this.lastUpdate;
    this.lastUpdate = undefined;

    const state = this.getNetworkState();
    state.frame = msg.frame;
    state.lastConfirmedAction = msg.lastProcessedInput || -1;

    // Snap world state to the latest snapshot.
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
  }

  sendUserInput() {
    const actionEntity = this.queries.action.results[0];
    const actionState = actionEntity.getMutableComponent(ActionState);
    const current = actionState.current;
    this.socketService.sendPlayerAction(current);
  }

  getNetworkState(): NetworkState {
    return this.queries.network.results[0].getMutableComponent(NetworkState);
  }
}
