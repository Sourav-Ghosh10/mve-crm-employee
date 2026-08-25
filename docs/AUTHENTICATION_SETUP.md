# PulseOps Authentication Setup Guide

This guide will help you set up and test the JWT authentication system for PulseOps.

## ✅ What's Been Implemented

### Frontend Changes
- ✅ Removed refresh token functionality
- ✅ Simplified to use only JWT access tokens
- ✅ Updated `api.ts` to handle 401 errors with simple redirect
- ✅ Updated `authService.ts` to work with single token
- ✅ Updated Redux `authSlice.ts` to use single token

### Backend Implementation
- ✅ Express.js server with JWT authentication
- ✅ Login endpoint (`POST /api/auth/login`)
- ✅ Logout endpoint (`POST /api/auth/logout`)
- ✅ Get current user endpoint (`GET /api/auth/me`)
- ✅ JWT middleware for protected routes
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend

## 🚀 Quick Start

### 1. Backend Setup (Already Done!)

The backend server is already running on `http://localhost:5000`

**Default Credentials:**
- Email: `admin@pulseops.com`
- Password: `Admin@123`

### 2. Frontend Setup

The frontend is already configured to connect to the backend at `http://localhost:5000/api`

### 3. Test the Login

1. Start the frontend development server (if not already running):
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173/login`

3. Use the default credentials:
   - Email: `admin@pulseops.com`
   - Password: `Admin@123`

4. Click "Sign In"

## 📁 Project Structure

```
PulseOps-employee-portal-Frontend/
├── backend/                    # Backend API
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   └── auth.js            # Auth endpoints (login, logout, me)
│   ├── .env                   # Environment variables
│   ├── .env.example           # Environment template
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Express server
│   └── README.md              # Backend documentation
│
├── src/
│   ├── services/
│   │   ├── api.ts             # ✨ Updated - Single token only
│   │   └── authService.ts     # ✨ Updated - Single token only
│   ├── store/
│   │   └── slices/
│   │       └── authSlice.ts   # ✨ Updated - Single token only
│   └── pages/
│       └── Login/
│           └── Login.tsx      # Login page (no changes needed)
```

## 🔐 How JWT Authentication Works

### 1. Login Flow
```
User enters credentials
    ↓
Frontend sends POST to /api/auth/login
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Frontend stores token in localStorage
    ↓
User is redirected to dashboard
```

### 2. Protected Routes
```
User makes request to protected route
    ↓
Frontend adds "Authorization: Bearer <token>" header
    ↓
Backend verifies JWT token
    ↓
If valid: Return data
If invalid/expired: Return 401
    ↓
Frontend redirects to login on 401
```

### 3. Logout Flow
```
User clicks logout
    ↓
Frontend sends POST to /api/auth/logout (optional)
    ↓
Frontend removes token from localStorage
    ↓
User is redirected to login page
```

## 🧪 Testing the API

### Test Login with curl
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pulseops.com","password":"Admin@123"}'
```

### Test Get Current User
```bash
# Replace <YOUR_TOKEN> with the token from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

## 🔧 Configuration

### Backend Environment Variables
Located in `backend/.env`:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Frontend API URL
The frontend is configured to use `http://localhost:5000/api` as the base URL.
This is set in `src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

## 🎯 Key Features

### Security Features
- ✅ JWT tokens with expiration (24 hours)
- ✅ Password hashing with bcrypt
- ✅ Secure token storage in localStorage
- ✅ Authorization header for API requests
- ✅ 401 error handling with automatic redirect

### Token Management
- ✅ Token stored in localStorage as "accessToken"
- ✅ Token automatically added to all API requests
- ✅ Token cleared on logout
- ✅ Automatic redirect to login on 401 errors

## 📝 API Endpoints

### POST /api/auth/login
**Request:**
```json
{
  "email": "admin@pulseops.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@pulseops.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "department": "Management",
      "position": "System Administrator",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@pulseops.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "department": "Management",
      "position": "System Administrator",
      "status": "active"
    }
  }
}
```

## 🚨 Troubleshooting

### Backend not starting?
1. Check if port 5000 is available
2. Verify `.env` file exists in backend folder
3. Check console for error messages

### Login not working?
1. Verify backend is running on http://localhost:5000
2. Check browser console for errors
3. Verify credentials are correct
4. Check CORS settings in backend

### Token not persisting?
1. Check localStorage in browser DevTools
2. Verify token is being saved after login
3. Check if token is being sent in request headers

## 🎓 Next Steps

1. **Add More Users**: Modify `backend/routes/auth.js` to add more users
2. **Database Integration**: Replace the mock users array with a real database
3. **User Registration**: Add a registration endpoint
4. **Password Reset**: Implement forgot password functionality
5. **Role-Based Access**: Add role-based route protection
6. **Token Refresh**: Add refresh token if sessions need to be longer

## 📚 Resources

- [JWT.io](https://jwt.io/) - Learn about JWT tokens
- [Express.js](https://expressjs.com/) - Backend framework
- [bcrypt](https://www.npmjs.com/package/bcryptjs) - Password hashing

---

**Happy Coding! 🚀**
