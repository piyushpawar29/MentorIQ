# MentorIQ Backend API

This is the backend API for the MentorIQ mentorship platform. It provides all the necessary endpoints for authentication, user management, mentorship sessions, and messaging.

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory
   ```
   cd backend
   ```
3. Install dependencies
   ```
   npm install
   ```
4. Set up environment variables by creating a config.env file in the config folder with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/connectEd
   JWT_SECRET=your_jwt_secret
   JWT_COOKIE_EXPIRE=30
   NODE_ENV=development
   ```

### Running the Server

- For development (with nodemon):
  ```
  npm run dev
  ```
- For production:
  ```
  npm start
  ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get logged in user
- `GET /api/auth/logout` - Logout user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password

### Mentors
- `GET /api/mentors` - Get all mentors
- `GET /api/mentors/:id` - Get single mentor
- `GET /api/mentors/profile` - Get mentor profile (for logged in mentor)
- `PUT /api/mentors/profile` - Update mentor profile

### Mentees
- `GET /api/mentees/profile` - Get mentee profile (for logged in mentee)
- `PUT /api/mentees/profile` - Update mentee profile
- `GET /api/mentees/mentors` - Get all connected mentors
- `POST /api/mentees/connect/:mentorId` - Connect with a mentor
- `DELETE /api/mentees/disconnect/:mentorId` - Disconnect from a mentor

### Sessions
- `GET /api/sessions` - Get all sessions for logged in user
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get a single session
- `PUT /api/sessions/:id` - Update a session
- `DELETE /api/sessions/:id` - Delete a session
- `PUT /api/sessions/:id/status` - Update session status

### Reviews
- `GET /api/mentors/:mentorId/reviews` - Get reviews for a mentor
- `POST /api/mentors/:mentorId/reviews` - Add review for a mentor
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Messages
- `GET /api/messages/conversations` - Get all conversations for a user
- `GET /api/messages/:userId` - Get messages between two users
- `POST /api/messages` - Send a message
- `DELETE /api/messages/:id` - Delete a message
- `GET /api/messages/unread` - Get unread message count

## Models

The application includes the following models:

- **User**: Basic user information and authentication details
- **MentorProfile**: Profile information for mentors
- **MenteeProfile**: Profile information for mentees
- **Session**: Mentoring session information
- **Review**: Reviews for mentors
- **Message**: Messages between users

## Real-Time Features

The backend implements Socket.io for real-time communication, including:

- Chat messaging
- Typing indicators
- Notifications

## Authentication

Authentication is handled with JSON Web Tokens (JWT). To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

## Error Handling

The API follows a consistent error response format:

```json
{
  "success": false,
  "message": "Error message details"
}
``` 