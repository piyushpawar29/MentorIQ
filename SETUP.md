# MentorIQ Setup Guide

## Fixing 403 Forbidden Errors

If you're experiencing 403 Forbidden errors when accessing the mentor dashboard, follow these steps to resolve them:

### 1. Set Environment Variables

Create a file named `.env.local` in the project root directory with the following content:

```
# Backend API URL
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 2. Check Backend Server

Make sure your backend server is running at http://localhost:5001 before accessing the dashboard.

### 3. Authentication Flow

1. Ensure you've completed the signup/login process to get a valid token
2. Check your browser's local storage to verify the token is saved
3. Try logging out and logging back in to refresh the token

### 4. Clear Cache and Cookies

If problems persist, try clearing your browser cache and cookies, then log in again.

### 5. Check Console for Errors

Open your browser's developer tools (F12) and check the Console tab for specific error messages that might provide more details about the 403 errors.

## API Troubleshooting

The following API endpoints are used by the mentor dashboard:

- `/api/mentor/profile` - Fetches the mentor profile
- `/api/mentor/sessions` - Fetches upcoming sessions
- `/api/mentor/profile/availability` - Updates availability settings

If any specific endpoint is failing, you can check the server logs for more details. 