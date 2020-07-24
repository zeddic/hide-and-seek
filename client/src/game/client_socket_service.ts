import {
  InitGameMessage,
  MessageType,
  PlayerActionMessage,
  StateUpdateMessage,
} from 'lancer-shared/lib/messages';
import {fromEvent, Observable} from 'rxjs';
import io from 'socket.io-client';
import {inProd} from '../env';

const DEV_SERVER = 'http://localhost:8080';

const PROD_PORT_HTTP = '8080';
const PROD_PORT_HTTPS = '8081';
const PROD_PORT =
  window.location.protocol === 'https:' ? PROD_PORT_HTTPS : PROD_PORT_HTTP;
const PROD_SERVER = `${window.location.protocol}//zeddic.com:${PROD_PORT}`;

const SERVER = inProd() ? PROD_SERVER : DEV_SERVER;

export class ClientSocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  constructor() {
    this.socket = io(SERVER, {autoConnect: false});
  }

  public connect() {
    this.socket.connect();
  }

  public sendPlayerAction(msg: PlayerActionMessage): void {
    this.socket.emit(MessageType.PLAYER_ACTION, msg);
  }

  public onStateUpdate(): Observable<StateUpdateMessage> {
    return fromEvent(this.socket, MessageType.STATE_UPDATE);
  }

  public onInitGame(): Observable<InitGameMessage> {
    return fromEvent(this.socket, MessageType.INIT);
  }

  // disconnect - used when unmounting
  public disconnect(): void {
    this.socket.disconnect();
  }
}
