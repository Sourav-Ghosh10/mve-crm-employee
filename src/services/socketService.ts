import { io, Socket } from 'socket.io-client';
import type { User } from '../types/user.types';
import { tokenStorage } from './api';

let socket: Socket | null = null;
let notificationCallback: (() => void) | null = null;

export const setNotificationCallback = (cb: () => void) => {
  notificationCallback = cb;
};

/**
 * Resolve socket URL safely
 */
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace('/api', '');
};

export const initializeSocket = (user: User) => {
  if (!user) return;
  if (socket?.connected) return;

  const token = tokenStorage.getAccessToken();
  if (!token) {
    console.warn('⚠️ No token found, socket not initialized');
    return;
  }

  socket = io(getSocketUrl(), {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);

    // 1️⃣ Authenticate
    socket?.emit('authenticate', { token });

    // 2️⃣ Join rooms (ONLY if values exist)
    socket?.emit('join:rooms', {
      userId: user.id,
      departmentId: user.department || null,
      role: user.role || null,
      locationId: user.location || null,
    });

    // console.log('📡 join:rooms emitted');
  });

  socket.on('authenticated', () => {
    // console.log('🔐 Socket authenticated successfully');
  });

  socket.on('announcement:new', () => {
    // console.log('📢 Live announcement received:', payload);

    // const announcement = payload?.data || payload;

    // toast(announcement.title, {
    //   icon: '📢',
    //   duration: 5000,
    // });

    notificationCallback?.();
  });

  socket.on('disconnect', (reason) => {
    console.warn('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });
};

export const disconnectSocket = () => {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  notificationCallback = null;

  console.log('🔌 Socket fully disconnected');
};

export const getSocket = () => socket;
export const isSocketConnected = () => Boolean(socket?.connected);
