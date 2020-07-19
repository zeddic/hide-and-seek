import {Attributes, Entity, System, World} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {StateUpdateMessage} from 'lancer-shared/lib/messages';
import {ActionStateComponent} from './client_action_system';
import {ClientNetworkComponent} from './client_network_component';
import {ClientSocketService} from './client_socket_service';

/**
 * A system that recieves state syncs game state between the client and
 * server versions of the game.
 */
export class ClientNetworkSystem extends System {
  private readonly socketService: ClientSocketService;
  private readonly entities = new Map<number, Entity>();
  private frame: number = -1;

  static queries = {
    network: {
      components: [ClientNetworkComponent],
    },
    action: {
      components: [ActionStateComponent],
    },
  };

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.socketService = new ClientSocketService();
    this.socketService.init();
    this.socketService
      .onStateUpdate()
      .subscribe(msg => this.onStateUpdate(msg));
  }

  init() {
    this.world.registerComponent(ClientNetworkComponent, false);
    this.world.createEntity().addComponent(ClientNetworkComponent);
  }

  private onStateUpdate(msg: StateUpdateMessage) {
    // console.log(msg.frame);
    this.frame = msg.frame;

    for (const update of msg.updates) {
      const id = update.id;
      const entity = this.entities.has(id)
        ? this.entities.get(id)
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

    // todo: improve the update protocol.
    // Options:
    // (1) Always send everything. If something is new, create a new client
    //     entity. If something is missing, delete a client entity. For
    //     this games complexity, this may be simple and fast enough.
    // (2) Send deltas. Only items that change get sent. Would need seperate
    //     messages for adding/removing options.
  }

  private createEntity(id: number) {
    const entity = this.world
      .createEntity()
      .addComponent(Position)
      .addComponent(Movement);

    this.entities.set(id, entity);
    return entity;
  }

  execute(delta: number, time: number) {
    const actionEntity = this.queries.action.results[0];
    const actionStateComponent = actionEntity.getMutableComponent(
      ActionStateComponent
    );

    // const networkEntity = this.queries.network.results[0];
    // const networkComponent = actionEntity.getMutableComponent(
    //   ClientNetworkComponent
    // );

    const actionsState = actionStateComponent.state;
    actionsState.frame = this.frame;

    if (Object.keys(actionsState.actions).length > 0) {
      this.socketService.sendPlayerAction(actionsState);
    }

    // console.log(actionsState);
    // console.log(actionStateComponent.state);
    // console.log();

    // todo: send user input back to server on a fixed interval
  }
}
