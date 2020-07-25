import {Attributes, Entity, System, World} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {InitGameMessage, StateUpdateMessage} from 'lancer-shared/lib/messages';
import {ActionState} from './action_system';
import {ClientSocketService} from './client_socket_service';
import {LocalPlayerControlled} from './local_player_controlled';
import {NetworkState} from './network_state';

/**
 * A system that recieves state syncs game state between the client and
 * server versions of the game.
 */
export class NetworkSystem extends System {
  private readonly socketService: ClientSocketService;
  private readonly entitiesById = new Map<number, Entity>();
  private readonly seen = new Set<number>();
  private lastStateUpdateMsg?: StateUpdateMessage;

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
  }

  init() {
    this.world.registerComponent(NetworkState, false);
    this.world.createEntity().addComponent(NetworkState);
    this.initSocket();
  }

  /**
   * Setup the socket connection and listen for incomming messages.
   */
  initSocket() {
    this.socketService.onInitGame().subscribe(msg => this.onInitGameMsg(msg));
    this.socketService
      .onStateUpdate()
      .subscribe(msg => this.onStateUpdateMsg(msg));

    this.socketService.connect();
  }

  /**
   * Server confirmed us joining and assiged us a playerid.
   */
  private onInitGameMsg(msg: InitGameMessage) {
    const state = this.getNetworkState();
    state.frame = msg.currentFrame;
    state.playerId = msg.playerId;

    // Create an entity for the current player.
    this.createEntity(msg.entityId).addComponent(LocalPlayerControlled);
  }

  /**
   * Server send a new game state update.
   */
  private onStateUpdateMsg(msg: StateUpdateMessage) {
    // Defer processing until the execute stage.
    this.lastStateUpdateMsg = msg;
  }

  execute() {
    this.processServerStateMessage();
    this.sendUserInput();
  }

  /**
   * Processes the most recent state update recieved by the server.
   * Updates the client game state to match.
   */
  processServerStateMessage() {
    if (!this.lastStateUpdateMsg) {
      return;
    }

    const msg = this.lastStateUpdateMsg;
    this.lastStateUpdateMsg = undefined;

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

  private createEntity(id: number): Entity {
    const entity = this.world
      .createEntity()
      .addComponent(Position)
      .addComponent(Movement);

    this.entitiesById.set(id, entity);
    return entity;
  }

  getNetworkState(): NetworkState {
    return this.queries.network.results[0].getMutableComponent(NetworkState);
  }
}
