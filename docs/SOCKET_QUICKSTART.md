# Socket.IO Integration - Quick Start

## ✅ What's Been Implemented

### 1. Socket Service (`src/services/socketService.ts`)
- Manages WebSocket connection to backend
- Handles authentication and room joining
- Listens for `announcement:new` events
- Shows toast notifications with priority-based styling
- Increments notification badge count

### 2. Socket Hook (`src/hooks/useSocket.ts`)
- Custom React hook for socket management
- Auto-connects when user logs in
- Auto-disconnects when user logs out
- Provides `newNotificationCount` and `resetNotificationCount`

### 3. Header Component Updates
- Integrated `useSocket` hook
- Combined notification count (existing + real-time)
- Resets real-time count when dropdown opens
- Shows toast notifications for new announcements

### 4. Environment Configuration
- Added `VITE_SOCKET_URL` to `.env`
- Defaults to `http://localhost:5000`

## 🚀 How to Test

1. **Start Backend** (with Socket.IO server running on port 5000)
2. **Start Frontend**: `npm run dev`
3. **Login** to the employee portal
4. **Check Console**: Should see "✅ Socket connected" and "✅ Socket authenticated"
5. **Create Announcement** from admin portal
6. **Verify**:
   - Toast notification appears
   - Bell icon badge increments
   - Clicking bell resets the count

## 📋 Backend Requirements

Your backend needs to implement:

### 1. Socket.IO Server Setup
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});
```

### 2. Authentication Handler
```javascript
io.on('connection', (socket) => {
  socket.on('authenticate', ({ userId, department, role, location }) => {
    // Join user to appropriate rooms
    socket.join(`user:${userId}`);
    socket.join(`department:${department}`);
    socket.join(`role:${role}`);
    socket.join(`location:${location}`);
    
    socket.emit('authenticated', { success: true });
    console.log(`User ${userId} authenticated and joined rooms`);
  });
});
```

### 3. Announcement Broadcasting
```javascript
// When creating a new announcement
const broadcastAnnouncement = (announcement) => {
  const rooms = [];
  
  // Build room list based on target audience
  if (announcement.targetAudience.departments?.length > 0) {
    announcement.targetAudience.departments.forEach(dept => {
      rooms.push(`department:${dept}`);
    });
  } else {
    rooms.push('department:all'); // or broadcast to all departments
  }
  
  // Similar for roles and locations
  if (announcement.targetAudience.roles?.length > 0) {
    announcement.targetAudience.roles.forEach(role => {
      rooms.push(`role:${role}`);
    });
  }
  
  if (announcement.targetAudience.locations?.length > 0) {
    announcement.targetAudience.locations.forEach(loc => {
      rooms.push(`location:${loc}`);
    });
  }
  
  // Broadcast to all relevant rooms
  rooms.forEach(room => {
    io.to(room).emit('announcement:new', {
      event: 'announcement:new',
      data: {
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        expiryDate: announcement.expiryDate,
        acknowledgmentRequired: announcement.acknowledgmentRequired,
        publishedBy: {
          name: announcement.publishedBy.name
        }
      }
    });
  });
};
```

## 🔍 Console Logs to Look For

### Frontend
- ✅ `Initializing socket connection to: http://localhost:5000`
- ✅ `Socket connected: <socket-id>`
- ✅ `Socket authenticated: { success: true }`
- 📢 `New announcement received: <payload>`

### Backend
- `User <userId> authenticated and joined rooms`
- `Broadcasting announcement to rooms: [...]`

## 🐛 Troubleshooting

### Socket Not Connecting
1. Check backend Socket.IO server is running
2. Verify `VITE_SOCKET_URL` in `.env`
3. Check CORS configuration on backend
4. Look for errors in browser console

### No Toast Notifications
1. Verify `<Toaster />` is in `App.tsx` ✅ (already added)
2. Check `react-hot-toast` is installed ✅ (already installed)
3. Verify announcement payload structure matches expected format

### Badge Not Updating
1. Check `useSocket` hook is being called in Header ✅ (already integrated)
2. Verify `newNotificationCount` state is updating
3. Check `setNotificationCallback` is set before socket connects

## 📦 Files Created/Modified

### Created
- ✅ `src/services/socketService.ts`
- ✅ `src/hooks/useSocket.ts`
- ✅ `docs/SOCKET_INTEGRATION.md`

### Modified
- ✅ `src/components/layout/Header.tsx`
- ✅ `src/App.tsx` (added Toaster)
- ✅ `.env` (added VITE_SOCKET_URL)

## 🎯 Next Steps

1. **Implement Backend Socket.IO Server** (see backend requirements above)
2. **Test the Integration**:
   - Login to employee portal
   - Create announcement from admin portal
   - Verify toast and badge update
3. **Optional Enhancements**:
   - Add sound notifications
   - Implement read receipts
   - Add desktop push notifications

## 📚 Full Documentation

See `docs/SOCKET_INTEGRATION.md` for complete documentation including:
- Detailed architecture
- Event handlers
- Security considerations
- Performance optimization
- Testing strategies
