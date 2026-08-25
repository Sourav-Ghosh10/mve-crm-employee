# Socket.IO Real-Time Notification Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.tsx                                │  │
│  │  - Renders <Toaster /> for notifications                 │  │
│  │  - Wraps app with ThemeProvider                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Header.tsx (Component)                       │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  1. useSocket() hook                               │  │  │
│  │  │     - Monitors auth state                          │  │  │
│  │  │     - Returns newNotificationCount                 │  │  │
│  │  │     - Provides resetNotificationCount()            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  2. Notification Bell Icon                         │  │  │
│  │  │     - Shows badge: unreadCount + newNotificationCount │
│  │  │     - Calls resetNotificationCount() on click      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           useSocket.ts (Custom Hook)                      │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  useEffect(() => {                                 │  │  │
│  │  │    if (isAuthenticated && user) {                  │  │  │
│  │  │      initializeSocket(user);                       │  │  │
│  │  │    } else {                                        │  │  │
│  │  │      disconnectSocket();                           │  │  │
│  │  │    }                                               │  │  │
│  │  │  }, [isAuthenticated, user]);                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         socketService.ts (Socket Manager)                 │  │
│  │                                                            │  │
│  │  initializeSocket(user) {                                 │  │
│  │    socket = io(SOCKET_URL, options);                      │  │
│  │                                                            │  │
│  │    socket.on('connect', () => {                           │  │
│  │      socket.emit('authenticate', {                        │  │
│  │        userId, department, role, location                 │  │
│  │      });                                                   │  │
│  │    });                                                     │  │
│  │                                                            │  │
│  │    socket.on('announcement:new', (payload) => {           │  │
│  │      toast(announcement.title, {...});                    │  │
│  │      notificationCallback(1);                             │  │
│  │    });                                                     │  │
│  │  }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    WebSocket Connection
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                            ▼                      BACKEND         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Socket.IO Server (server.js)                    │  │
│  │                                                            │  │
│  │  io.on('connection', (socket) => {                        │  │
│  │                                                            │  │
│  │    socket.on('authenticate', (data) => {                  │  │
│  │      socket.join(`user:${userId}`);                       │  │
│  │      socket.join(`department:${department}`);             │  │
│  │      socket.join(`role:${role}`);                         │  │
│  │      socket.join(`location:${location}`);                 │  │
│  │      socket.emit('authenticated', {success: true});       │  │
│  │    });                                                     │  │
│  │                                                            │  │
│  │  });                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      Announcement Controller (when new created)           │  │
│  │                                                            │  │
│  │  createAnnouncement() {                                    │  │
│  │    // Save to database                                     │  │
│  │    await announcement.save();                              │  │
│  │                                                            │  │
│  │    // Broadcast to relevant rooms                          │  │
│  │    const rooms = buildRoomList(announcement);              │  │
│  │    rooms.forEach(room => {                                 │  │
│  │      io.to(room).emit('announcement:new', {               │  │
│  │        event: 'announcement:new',                          │  │
│  │        data: announcement                                  │  │
│  │      });                                                    │  │
│  │    });                                                      │  │
│  │  }                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Event Flow Sequence

### 1. User Login
```
User → Login → Auth Success → useSocket detects auth
  → initializeSocket(user)
  → Socket connects to backend
  → Emit 'authenticate' event
  → Backend joins user to rooms
  → Backend emits 'authenticated'
  → Frontend logs success ✅
```

### 2. New Announcement Created
```
Admin creates announcement
  → Backend saves to database
  → Backend determines target rooms
  → Backend emits 'announcement:new' to rooms
  → Frontend socket receives event
  → Display toast notification 🔔
  → Increment badge count (+1)
  → User sees notification
```

### 3. User Views Notifications
```
User clicks bell icon
  → Dropdown opens
  → onNotificationOpen() called
  → resetNotificationCount() executed
  → Badge count resets to 0
  → User sees announcement list
```

### 4. User Logout
```
User → Logout → useSocket detects no auth
  → disconnectSocket()
  → Socket connection closed
  → Notification state cleared
```

## Room-Based Targeting

### How Rooms Work

```
User Profile:
{
  id: "user123",
  department: "engineering",
  role: "employee",
  location: "bangalore"
}

Backend Joins User to Rooms:
- user:user123
- department:engineering
- role:employee
- location:bangalore
```

### Announcement Targeting

```
Announcement Target Audience:
{
  departments: ["engineering", "hr"],
  roles: ["employee"],
  locations: ["bangalore"]
}

Backend Broadcasts To:
- department:engineering
- department:hr
- role:employee
- location:bangalore

Result:
✅ User receives announcement (matches all criteria)
```

### Empty Target = All Users

```
Announcement Target Audience:
{
  departments: [],  // Empty = all departments
  roles: [],        // Empty = all roles
  locations: []     // Empty = all locations
}

Backend Broadcasts To:
- All connected sockets (or broadcast to 'all' room)
```

## State Management

### Frontend State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store (Auth)                        │
│  { user, isAuthenticated }                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              useSocket Hook (Local State)                    │
│  { newNotificationCount, resetNotificationCount }           │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Header Component (Local State)                  │
│  { announcements, unreadCount }                              │
│                                                              │
│  Combined Badge Count = unreadCount + newNotificationCount  │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

### Connection Errors
```
socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  // Socket.IO will auto-retry with exponential backoff
});
```

### Disconnect Handling
```
socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
  // Reasons: 'io server disconnect', 'transport close', etc.
  // Socket.IO will auto-reconnect unless server disconnected
});
```

### Reconnection Strategy
```
Socket Options:
{
  reconnection: true,           // Enable auto-reconnect
  reconnectionDelay: 1000,      // Start with 1s delay
  reconnectionAttempts: 5       // Try 5 times
}

Retry Pattern:
Attempt 1: 1s delay
Attempt 2: 2s delay (exponential backoff)
Attempt 3: 4s delay
Attempt 4: 8s delay
Attempt 5: 16s delay
After 5 failures: Stop trying
```

## Performance Considerations

### Memory Management
- Socket disconnects on component unmount
- Callbacks are cleared on disconnect
- No memory leaks from event listeners

### Network Efficiency
- WebSocket preferred (binary, low overhead)
- Polling fallback (if WebSocket blocked)
- Room-based targeting (no unnecessary broadcasts)

### Scalability
- Backend can use Redis adapter for multi-server
- Rooms allow efficient message routing
- Only targeted users receive announcements
