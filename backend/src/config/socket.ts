import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setIO = (io: SocketIOServer) => {
  ioInstance = io;
};

export const getIO = (): SocketIOServer | null => {
  return ioInstance;
};

export const emitEvent = (event: string, data: any) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};

