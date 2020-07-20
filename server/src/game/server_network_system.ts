import {System, World, Attributes, Entity} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {
  SocketService,
  OnPlayerActionEvent,
  OnConnectEvent,
  OnDisconnectEvent,
} from './socket_service';
import {EntityUpdate} from 'lancer-shared/lib/messages';
import {RemotePlayerComponent} from './remote_player_component';

interface Player {
  id: number;
  entity: Entity;
}

export class ServerNetworkSystem extends System {
  static queries = {
    movable: {components: [Position]},
  };

  private readonly socketService: SocketService;
  private frame = 0;

  private playersById = new Map<number, Player>();

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
    const id = e.player;
    const entity = this.world
      .createEntity(`player${id}`)
      .addComponent(Position, {x: 100, y: 100})
      .addComponent(Movement)
      .addComponent(RemotePlayerComponent, {
        playerId: id,
      });

    const player = {entity, id};
    this.playersById.set(id, player);
  }

  onDisconnect(e: OnDisconnectEvent) {
    const id = e.player;
    const entity = this.playersById.get(id).entity;
    entity.remove();
    this.playersById.delete(id);
  }

  onPlayerAction(e: OnPlayerActionEvent) {
    const id = e.player;
    if (!this.playersById.has(id)) return;

    const player = this.playersById.get(id);
    const remote = player.entity.getMutableComponent(RemotePlayerComponent);
    remote.inputQueue.push(e.msg);
  }

  execute(delta: number, time: number) {
    const updates: EntityUpdate[] = [];

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Movement);

      const update = {
        id: entity.id,
        x: p.x,
        y: p.y,
        v: {x: m.v.x, y: m.v.y},
        a: {x: m.a.x, y: m.a.y},
      };

      updates.push(update);
    }

    // todo: will want to send custom updates per client that contain
    // info about their last processed input so we can do client side
    // reconcilliation.
    this.socketService.sendStateUpdate({frame: this.frame++, updates});
  }
}
