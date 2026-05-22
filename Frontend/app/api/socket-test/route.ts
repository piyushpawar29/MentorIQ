import { NextResponse } from 'next/server';
import { io } from 'socket.io-client';

// This is a simple API route to test socket.io connection
export async function GET() {
  try {
    // Create a socket connection to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const socket = io(backendUrl);
    
    // Wait for connection
    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('Connected to socket server!');
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
      
      // Set a timeout in case connection takes too long
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
    
    // Send a test message
    socket.emit('join', 'test-room');
    socket.emit('sendMessage', { 
      conversationId: 'test-room', 
      text: 'Hello from Next.js API route!',
      senderId: 'api-route',
      senderName: 'API Route'
    });
    
    // Disconnect after sending
    socket.disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Socket test completed successfully' 
    });
  } catch (error) {
    console.error('Socket test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Socket test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
