import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Singleton socket instance
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
};

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const joinCustomerRoom = (queueToken) => {
    if (queueToken) socket.emit('join-customer-room', queueToken);
  };

  const joinAdminRoom = () => {
    socket.emit('join-admin-room');
  };

  const onQueueUpdate = (callback) => {
    socket.off('queue-updated');
    socket.on('queue-updated', callback);
  };

  const onTableReady = (callback) => {
    socket.off('table-ready');
    socket.on('table-ready', callback);
  };

  const onQueueCancelled = (callback) => {
    socket.off('queue-cancelled');
    socket.on('queue-cancelled', callback);
  };

  const onOrderReady = (callback) => {
    socket.off('order-ready');
    socket.on('order-ready', callback);
  };

  const off = (event, callback) => {
    socket.off(event, callback);
  };

  return {
    socket,
    isConnected,
    joinCustomerRoom,
    joinAdminRoom,
    onQueueUpdate,
    onTableReady,
    onQueueCancelled,
    onOrderReady,
    off,
  };
};