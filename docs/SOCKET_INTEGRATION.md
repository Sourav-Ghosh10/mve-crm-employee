# Socket.IO Real-Time Notifications Integration

## Overview
This document describes the Socket.IO client implementation for real-time announcement notifications in the PulseOps Employee Portal.

## Architecture

### Components

1. **Socket Service** (`src/services/socketService.ts`)
   - Manages WebSocket connection lifecycle
   - Handles authentication and room joining
   - Processes incoming announcement events
   - Displays toast notifications
   - Updates notification badge count

2. **Socket Hook** (`src/hooks/useSocket.ts`)
   - React hook for managing socket state
   - Automatically connects/disconnects based on auth state
   - Provides notification count management
   - Integrates with Redux auth state

3. **Header Component** (`src/components/layout/Header.tsx`)
   - Displays notification bell icon with badge
   - Shows combined count (existing + real-time)
   - Resets real-time count when dropdown opens

## How It Works

### Connection Flow

1. **User Logs In**
   - `useSocket` hook detects authenticated user
   - Calls `initializeSocket(user)` with user data
   - Socket connects to backend server

2. **Authentication**
   - Socket emits `authenticate` event with:
     - `userId`: User's unique ID
     - `department`: User's department
     - `role`: User's role
     - `location`: User's location
   - Backend joins user to appropriate rooms

3. **Receiving Announcements**
   - Backend emits `announcement:new` when new announcement is published
   - Frontend receives event with announcement data
   - Toast notification is displayed (color-coded by priority)
   - Notification badge count increments

4. **User Logs Out**
   - `useSocket` hook calls `disconnectSocket()`
   - Socket connection is closed
   - Notification state is reset

### Event Handlers

#### `connect`
```typescript
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket?.id);
  socket?.emit('authenticate', { userId, department, role, location });
});
```

#### `authenticated`
```typescript
socket.on('authenticated', (data) => {
  console.log('✅ Socket authenticated:', data);
});
```

#### `announcement:new`
```typescript
socket.on('announcement:new', (payload) => {
  const announcement = payload.data;
  
  // Show toast with priority-based styling
  toast(announcement.title, {
    icon: priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🔵',
    duration: 5000,
    style: { /* priority-based colors */ }
  });
  
  // Increment badge count
  notificationCallback(1);
});
```

#### `disconnect`
```typescript
socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});
```

## Configuration

### Environment Variables

Add to `.env`:
```bash
VITE_SOCKET_URL="http://localhost:5000"
```

For production:
```bash
VITE_SOCKET_URL="https://your-backend-domain.com"
```

### Socket Options

```typescript
{
  transports: ['websocket', 'polling'],  // Try WebSocket first, fallback to polling
  reconnection: true,                     // Auto-reconnect on disconnect
  reconnectionDelay: 1000,                // Wait 1s before reconnecting
  reconnectionAttempts: 5                 // Try 5 times before giving up
}
```

## Usage

### In Components

The socket connection is managed automatically. To use notification features:

```typescript
import { useSocket } from '../hooks/useSocket';

function MyComponent() {
  const { newNotificationCount, resetNotificationCount } = useSocket();
  
  // Display count
  <Badge count={newNotificationCount} />
  
  // Reset when user views notifications
  <Button onClick={resetNotificationCount}>View</Button>
}
```

### Manual Socket Access

```typescript
import { getSocket, isSocketConnected } from '../services/socketService';

const socket = getSocket();
if (isSocketConnected()) {
  socket?.emit('custom-event', data);
}
```

## Backend Requirements

The backend must implement:

1. **Socket.IO Server**
   ```javascript
   const io = require('socket.io')(server, {
     cors: { origin: process.env.FRONTEND_URL }
   });
   ```

2. **Authentication Handler**
   ```javascript
   socket.on('authenticate', ({ userId, department, role, location }) => {
     // Join user to rooms
     socket.join(`user:${userId}`);
     socket.join(`department:${department}`);
     socket.join(`role:${role}`);
     socket.join(`location:${location}`);
     
     socket.emit('authenticated', { success: true });
   });
   ```

3. **Announcement Broadcasting**
   ```javascript
   // When new announcement is created
   const rooms = [];
   if (announcement.targetAudience.departments.length > 0) {
     announcement.targetAudience.departments.forEach(dept => {
       rooms.push(`department:${dept}`);
     });
   }
   // ... similar for roles and locations
   
   rooms.forEach(room => {
     io.to(room).emit('announcement:new', {
       event: 'announcement:new',
       data: announcement
     });
   });
   ```

## Troubleshooting

### Connection Issues

**Problem**: Socket not connecting
- Check `VITE_SOCKET_URL` is set correctly
- Verify backend Socket.IO server is running
- Check browser console for connection errors
- Ensure CORS is configured on backend

**Problem**: Authentication failing
- Verify user object has required fields (id, department, role, location)
- Check backend authentication handler logs
- Ensure JWT token is valid

### Notification Issues

**Problem**: Toast not showing
- Check `react-hot-toast` is installed
- Verify `<Toaster />` component is in App.tsx
- Check browser console for errors

**Problem**: Badge count not updating
- Verify `setNotificationCallback` is called in `useSocket`
- Check `newNotificationCount` state in Header component
- Ensure `resetNotificationCount` is called when dropdown opens

## Testing

### Manual Testing

1. **Login**: Verify socket connects (check console logs)
2. **Create Announcement**: Create announcement from admin portal
3. **Verify Toast**: Toast should appear with announcement title
4. **Check Badge**: Bell icon badge should increment
5. **Open Dropdown**: Badge should reset when dropdown opens
6. **Logout**: Socket should disconnect (check console logs)

### Console Logs

Look for these messages:
- ✅ `Socket connected: <socket-id>`
- ✅ `Socket authenticated: { success: true }`
- 📢 `New announcement received: <payload>`
- ❌ `Socket disconnected: <reason>`

## Security Considerations

1. **Authentication**: Socket authentication uses user data from JWT
2. **Room-based Access**: Users only receive announcements for their department/role/location
3. **No Sensitive Data**: Announcements are already filtered by backend
4. **Auto-disconnect**: Socket disconnects on logout to prevent unauthorized access

## Performance

- **Reconnection**: Automatic with exponential backoff
- **Transport**: WebSocket preferred, polling fallback
- **Memory**: Socket disconnects on unmount to prevent leaks
- **Bandwidth**: Only targeted announcements are sent (room-based)

## Future Enhancements

1. **Read Receipts**: Track when user views announcement
2. **Acknowledgments**: Allow user to acknowledge important announcements
3. **Offline Queue**: Store announcements received while offline
4. **Sound Notifications**: Optional sound for high-priority announcements
5. **Desktop Notifications**: Browser push notifications (with permission)
