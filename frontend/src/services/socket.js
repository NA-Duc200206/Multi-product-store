import { io } from 'socket.io-client';

// Connect to current origin; Vite proxy or production server handles /socket.io
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to real-time server via Socket.io');
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from real-time server');
    });
  }
  return socket;
};

export const subscribeToEvent = (event, callback) => {
  const s = getSocket();
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
};

