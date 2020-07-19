import {System, World, Attributes} from 'ecsy';
import {Movement} from 'lancer-shared/lib/game/movement_component';
import {Position} from 'lancer-shared/lib/game/position_component';
import {Socket} from 'socket.io';
import {SocketService, OnPlayerActionEvent} from './socket_service';
import {EntityUpdate} from 'lancer-shared/lib/messages';

/**
 */
export class ServerNetworkSystem extends System {
  static queries = {
    movable: {components: [Position, Movement]},
  };

  private readonly socketService: SocketService;
  private frame = 0;

  constructor(world: World, attributes: Attributes) {
    super(world, attributes);
    this.socketService = new SocketService();
  }

  init() {
    this.socketService.onPlayerAction().subscribe(e => this.onPlayerAction(e));
  }

  onPlayerAction(e: OnPlayerActionEvent) {
    // console.log(e);
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

    this.socketService.sendStateUpdate({frame: this.frame++, updates});
  }
}
