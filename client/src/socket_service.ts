import io from 'socket.io-client';
import {fromEvent, Observable} from 'rxjs';
import {ChatMessage} from 'lancer-shared/lib/messages';
import {inProd} from './env';

const DEV_SERVER = 'http://localhost:8080';

const PROD_PORT_HTTP = '8080';
const PROD_PORT_HTTPS = '8081';
const PROD_PORT =
  location.protocol === 'https:' ? PROD_PORT_HTTPS : PROD_PORT_HTTP;
const PROD_SERVER = `zeddic.com:${PROD_PORT}`;

console.log(PROD_PORT);
console.log(PROD_SERVER);

const SERVER = inProd() ? PROD_SERVER : DEV_SERVER;

export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init(): SocketService {
    this.socket = io(SERVER);
    return this;
  }

  // send a message for the server to broadcast
  public send(message: ChatMessage): void {
    this.socket.emit('message', message);
  }

  // link message event to rxjs data source
  public onMessage(): Observable<ChatMessage> {
    return fromEvent(this.socket, 'message');
  }

  // disconnect - used when unmounting
  public disconnect(): void {
    this.socket.disconnect();
  }
}
