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
  on(event: EventName, handler: DataHandler<Socket>);
}

export interface Server {
  of(name: NamespaceName): Namespace;
}

export interface ServerCreator<S extends Server> {
  (server: HTTPServer): S;
}

/* tslint:disable:max-classes-per-file */

export class MockServerSocket implements Socket {
  emittedData: { event: EventName, data: any }[] = [];
  handlers: { [ event: string ]: DataHandler<any> } = {};
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
    this.handlers[ eventName ] = handler;
  }

  handleData(eventName: EventName, data: any) {
    if (this.handlers[ eventName ]) {
      this.handlers[ eventName ](data);
    } else {
      throw new Error('Tried to handle data!');
    }
  }

  get namespace(): MockServerNamespace | null {
    if (this.socketServer) {
      return this.socketServer[ this.namespaceName ];
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
    this.isClosed = close;
    this.socketServer = null;
  }

  allEvents(): EventName[] {
    return this.emittedData.reduce((acc, emission) => {
      return acc.concat(emission.event);
    }, [] as EventName[]);
  }
}

export class MockServerNamespace implements Namespace {
  name: NamespaceName;
  sockets: Socket[];
  onSocketConnectHandler: DataHandler<Socket>;
  constructor(public socketServer: MockServerSocketServer) { }
  on(eventName: EventName, handler: DataHandler<Socket>) {
    if (eventName === 'connection') {
      this.onSocketConnectHandler = handler;
    } else {
      throw new Error(`Unknown namespace event to handle: ${eventName}`);
    }
  }
  onSocketConnect(socket: Socket) {
    this.sockets.push(socket);
    this.onSocketConnectHandler(socket);
  }
}

export class MockServerSocketServer implements Server {
  namespaces: { [ name: string ]: MockServerNamespace } = {};
  of(name: NamespaceName) {
    if (this.namespaces[ name ]) {
      throw new Error('Tried to create an already existing namespace!');
    } else {
      this.namespaces[ name ] = new MockServerNamespace(this);

      return this.namespaces[ name ];
    }
  }
  registerHandler(id: ID, name: NamespaceName, eventName: EventName, handler: DataHandler<any>) {
    return id.length + name.length + eventName.length + handler.length;
  }

  createSocket(id: ID, name: NamespaceName): Socket {
    const newSocket = new MockServerSocket(id, name, this);
    this.namespaces[ name ].onSocketConnect(newSocket);
    return newSocket;
  }
}

export const mockSocketServerCreator: ServerCreator<MockServerSocketServer>
  = (_server) => new MockServerSocketServer();

/* tslint:enable:max-classes-per-file */
