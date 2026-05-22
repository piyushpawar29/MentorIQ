# MentorIQ - Mentorship Platform

A comprehensive mentorship platform connecting mentors and mentees.

## Project Structure

- **Frontend**: Next.js application
- **Backend**: Node.js/Express API server with MongoDB

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/connected
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

5. Verify the backend is running at http://localhost:5001

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following content:
   ```
   BACKEND_URL=http://localhost:5001
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
   ```

4. Start the frontend development server:
   ```
   npm run dev
   ```

5. Access the application at http://localhost:3000

## Troubleshooting

### 404 Not Found / 403 Forbidden Errors

If you encounter 404 Not Found or 403 Forbidden errors when accessing the mentor dashboard:

1. Ensure both backend and frontend servers are running
2. Check that you've created the `.env.local` file in the Frontend directory
3. Make sure you're logged in with valid credentials
4. Check browser console for specific error messages
5. Verify that your JWT token is valid and not expired

### API Connection Issues

The mentor dashboard directly connects to the backend API. If you see connection errors:

1. Verify the backend server is running at http://localhost:5001
2. Check that your CORS settings in the backend allow requests from the frontend
3. Ensure your authentication token is valid
4. Try logging out and logging back in to refresh your token

## Features

- User authentication (login/signup)
- Mentor and mentee profiles
- Session booking and management
- Real-time messaging
- Reviews and ratings
- Availability management 