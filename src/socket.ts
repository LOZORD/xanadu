import { Server as HTTPServer } from 'http';

export interface Socket {
  id: ID;
  emit<ED>(eventName: EventName, data: ED): void;
  on<OD>(eventName: EventName, handler: DataHandler<OD>);
  disconnect(close?: boolean): void;
}

export type ID = string;
export type EventName = string;
export interface DataHandler<T> {
  (data: T): void;
}

export type NamespaceName = string;

export interface Namespace {
  sockets: { [id: string]: Socket };
  on(event: EventName, handler: DataHandler<Socket>);
}

export interface Server {
  nsps: { [namespace: string]: Namespace };
  of(name: NamespaceName): Namespace;
  close(callback?: () => void): void;
}

export interface ServerCreator<S extends Server> {
  (server: HTTPServer): S;
}

/* tslint:disable:max-classes-per-file */

export class MockServerSocket implements Socket {
  emittedData: { event: EventName, data: any }[] = [];
  handlers: { [event: string]: DataHandler<any> } = {};
  isClosed = false;
  constructor(
    public id: ID, public namespaceName: NamespaceName,
    public socketServer: MockServerSocketServer | null
  ) { }
  emit(eventName: EventName, data: any) {
    this.emittedData.push({
      data,
      event: eventName
    });
  }

  reset() {
    this.isClosed = false;
    this.emittedData = [];
  }

  on(eventName: EventName, handler: DataHandler<any>) {
    this.handlers[eventName] = handler;
  }

  respondsTo(eventName: EventName): boolean {
    return eventName in this.handlers;
  }

  handleData(eventName: EventName, data: any) {
    if (this.handlers[eventName]) {
      this.handlers[eventName](data);
    } else {
      throw new Error('Tried to handle data!');
    }
  }

  get namespace(): MockServerNamespace | null {
    if (this.socketServer) {
      return this.socketServer[this.namespaceName];
    } else {
      return null;
    }
  }

  connect() {
    if (this.namespace) {
      this.namespace.onSocketConnect(this);
    } else {
      throw new Error('Tried to connect without a namespace!');
    }
  }

  disconnect(close = false) {
    if (this.namespace) {
      this.namespace.onSocketDisconnect(this);
    }

    this.isClosed = close;
    this.socketServer = null;
  }

  allEvents(): EventName[] {
    return this.emittedData.map(emission => emission.event);
  }
}

export class MockServerNamespace implements Namespace {
  name: NamespaceName;
  sockets: { [id: string]: Socket } = {};
  onSocketConnectHandler: DataHandler<Socket>;
  constructor(public socketServer: MockServerSocketServer) { }
  on(eventName: EventName, handler: DataHandler<Socket>) {
    if (eventName === 'connection' || eventName === 'connect') {
      this.onSocketConnectHandler = handler;
    } else {
      throw new Error(`Unknown namespace event to handle: ${eventName}`);
    }
  }
  onSocketConnect(socket: Socket) {
    this.sockets[socket.id] = socket;
    this.onSocketConnectHandler(socket);
  }

  onSocketDisconnect(socket: Socket) {
    delete this.sockets[socket.id];
  }
}

export class MockServerSocketServer implements Server {
  isClosed = false;
  nsps: { [name: string]: MockServerNamespace } = {};
  of(name: NamespaceName) {
    if (this.nsps[name]) {
      throw new Error('Tried to create an already existing namespace!');
    } else {
      this.nsps[name] = new MockServerNamespace(this);

      return this.nsps[name];
    }
  }
  registerHandler(id: ID, name: NamespaceName, eventName: EventName, handler: DataHandler<any>) {
    return id.length + name.length + eventName.length + handler.length;
  }

  createAndHandleSocket(id: ID, name: NamespaceName): MockServerSocket {
    const newSocket = new MockServerSocket(id, name, this);
    this.nsps[name].onSocketConnect(newSocket);
    return newSocket;
  }

  close(callback?: () => void) {
    this.isClosed = true;
    if (callback) {
      callback();
    }
  }
}

export const mockSocketServerCreator: ServerCreator<MockServerSocketServer>
  = (_server) => new MockServerSocketServer();

/* tslint:enable:max-classes-per-file */
