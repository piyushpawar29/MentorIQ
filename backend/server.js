const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const http = require('http');
const socketio = require('socket.io');

// Load env vars – try config/config.env first (local dev), fall back to .env (Docker)
const envLoaded = dotenv.config({ path: './config/config.env' });
if (envLoaded.error) {
  dotenv.config();
}

// Connect to database
connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Allowed origins driven by env var so it works in any environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Define routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/mentees', require('./routes/mentees'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'MentorIQ API' });
});

// Error handler middleware
app.use(errorHandler);

// Socket.io event handlers
io.on('connection', (socket) => {
  // Join a conversation room
  socket.on('join', (conversationId) => {
    if (typeof conversationId === 'string') {
      socket.join(conversationId);
    }
  });

  // Relay messages to the conversation room
  socket.on('sendMessage', (message) => {
    if (message && typeof message.conversationId === 'string') {
      io.to(message.conversationId).emit('message', message);
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    if (data && typeof data.conversationId === 'string') {
      socket.to(data.conversationId).emit('typing', data);
    }
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`MentorIQ API running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});