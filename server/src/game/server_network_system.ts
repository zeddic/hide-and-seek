import {System, World, Attributes, Entity} from 'ecsy';
// import {Physics, Position} from 'lancer-shared/lib/game/components';
import {Physics} from 'lancer-shared/lib/game/components/physics';
import {Position} from 'lancer-shared/lib/game/components/position';
import {
  SocketService,
  OnPlayerActionEvent,
  OnConnectEvent,
  OnDisconnectEvent,
} from './socket_service';
import {EntityUpdate} from 'lancer-shared/lib/messages';
import {RemotePlayerControlled} from './remote_player_controlled';

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
    const playerId = e.player;
    const entity = this.world
      .createEntity(`player${playerId}`)
      .addComponent(Position, {x: 100, y: 100, width: 40, height: 40})
      .addComponent(Physics, {mass: 100})
      .addComponent(RemotePlayerControlled, {
        playerId: playerId,
      });

    const player = {entity, id: playerId};
    this.playersById.set(playerId, player);

    this.socketService.sendInit(playerId, {
      playerId,
      entityId: entity.id,
      currentFrame: this.frame,
      initialState: this.getGameState(),
    });
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
    const remote = player.entity.getMutableComponent(RemotePlayerControlled);
    remote.inputQueue.push(e.msg);
  }

  execute(delta: number, time: number) {
    const updates = this.getGameState();
    for (const player of this.playersById.values()) {
      const remote = player.entity.getComponent(RemotePlayerControlled);
      this.socketService.sendState(player.id, {
        frame: this.frame++,
        updates,
        lastProcessedInput: remote.lastProcessedInput,
      });
    }
  }

  private getGameState(): EntityUpdate[] {
    const updates: EntityUpdate[] = [];

    for (const entity of this.queries.movable.results) {
      const p = entity.getComponent(Position);
      const m = entity.getComponent(Physics);

      const update = {
        id: entity.id,
        x: p.x,
        y: p.y,
        w: p.width,
        h: p.height,
        v: {x: m.v.x, y: m.v.y},
        a: {x: m.a.x, y: m.a.y},
        m: m.mass,
      };

      updates.push(update);
    }

    return updates;
  }
}
