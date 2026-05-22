import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/use-socket';
import axios from 'axios';

// Import our custom components
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { motion } from 'framer-motion';

interface ChatProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: 'mentor' | 'mentee';
}

interface Conversation {
  partnerId: string;
  lastMessage: string;
  lastMessageDate: string;
  unread: number;
  partner: {
    name: string;
    avatar: string;
    role: string;
  };
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
  isRead: boolean;
  attachment?: string;
  attachmentType?: 'image' | 'document' | 'link' | 'none';
}

interface Contact {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
}

export default function Chat({ userId, userName, userAvatar, userRole }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [activePartnerName, setActivePartnerName] = useState<string>('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const { toast } = useToast();

  // Initialize socket connection
  const { 
    socket, 
    isConnected, 
    error: socketError, 
    connect, 
    joinConversation, 
    sendMessage: emitMessage, 
    sendTyping 
  } = useSocket({
    url: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001',
    autoConnect: true,
  });

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const formattedToken = token.startsWith('"') && token.endsWith('"') 
        ? token.slice(1, -1) 
        : token;
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/messages/conversations`, {
        headers: {
         Authorization: `Bearer ${formattedToken}`,
        },
      });
      
      if (response.data.success) {
        setConversations(response.data.data);
        
        // If there are conversations and no active conversation is selected,
        // select the first one automatically
        if (response.data.data.length > 0 && !activeConversation) {
          setActiveConversation(response.data.data[0].partnerId);
          setActivePartnerName(response.data.data[0].partner.name);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoadingConversations(false);
    }
  }, [activeConversation, toast]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!partnerId) return;
    
    setLoadingMessages(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const formattedToken = token.startsWith('"') && token.endsWith('"') 
        ? token.slice(1, -1) 
        : token;
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/messages/${partnerId}`, {
        headers: {
         Authorization: `Bearer ${formattedToken}`,
        },
      });
      
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoadingMessages(false);
    }
  }, [toast]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((partnerId: string) => {
    setActiveConversation(partnerId);
    
    // Find partner name
    const conversation = conversations.find(c => c.partnerId === partnerId);
    if (conversation) {
      setActivePartnerName(conversation.partner.name);
    }
    
    // Join the conversation room
    const conversationId = [userId, partnerId].sort().join('-');
    joinConversation(conversationId);
    
    // Fetch messages
    fetchMessages(partnerId);
    
    // Update unread count in the UI
    setConversations(prev => 
      prev.map(conv => 
        conv.partnerId === partnerId 
          ? { ...conv, unread: 0 } 
          : conv
      )
    );
  }, [conversations, fetchMessages, joinConversation, userId]);

  // Send a message
  const handleSendMessage = useCallback(async (text: string, attachment?: string, attachmentType?: string) => {
    if (!activeConversation || !text.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const formattedToken = token.startsWith('"') && token.endsWith('"') 
        ? token.slice(1, -1) 
        : token;
      
      // Create a temporary optimistic message
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        _id: tempId,
        sender: {
          _id: userId,
          name: userName,
          avatar: userAvatar,
        },
        receiver: {
          _id: activeConversation,
          name: activePartnerName,
        },
        text,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      
      // Add to messages immediately for UI responsiveness
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/messages`,
        {
          receiver: activeConversation,
          text,
          attachment,
          attachmentType: attachment ? attachmentType : 'none',
        },
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.success) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId ? response.data.data : msg
          )
        );
        
        // Update conversation list
        setConversations(prev => {
          const updatedConversations = [...prev];
          const existingIndex = updatedConversations.findIndex(
            c => c.partnerId === activeConversation
          );
          
          if (existingIndex !== -1) {
            // Update existing conversation
            updatedConversations[existingIndex] = {
              ...updatedConversations[existingIndex],
              lastMessage: text,
              lastMessageDate: new Date().toISOString(),
            };
          } else {
            // Add new conversation
            updatedConversations.unshift({
              partnerId: activeConversation,
              lastMessage: text,
              lastMessageDate: new Date().toISOString(),
              unread: 0,
              partner: {
                name: activePartnerName,
                avatar: '',
                role: userRole === 'mentor' ? 'mentee' : 'mentor',
              },
            });
          }
          
          return updatedConversations;
        });
        
        // Emit message via socket for real-time delivery
        const conversationId = [userId, activeConversation].sort().join('-');
        emitMessage({
          conversationId,
          text,
          //senderId: userId,
          //senderName: userName,
          //receiverId: activeConversation,
          //messageId: response.data.data._id,
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove the optimistic message
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  }, [activeConversation, activePartnerName, emitMessage, toast, userId, userName, userAvatar, userRole]);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!activeConversation) return;
    
    const conversationId = [userId, activeConversation].sort().join('-');
    sendTyping({
      conversationId,
      userId,
      isTyping,
    });
  }, [activeConversation, sendTyping, userId]);

  // Fetch contacts based on user role
  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const formattedToken = token.startsWith('"') && token.endsWith('"') 
        ? token.slice(1, -1) 
        : token;
      
      let response;
      
      // Use the correct endpoints based on user role
      if (userRole === 'mentor') {
        // Mentors need to see mentees
        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/mentors`, {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        });
      } else {
        // Mentees need to see mentors
        response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/mentors`, {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        });
      }
      
      if (response.data.success) {
        // Transform the data to a consistent format
        const formattedContacts = response.data.data.map((user: any) => ({
          _id: user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar: user.profilePicture || user.avatar,
          role: userRole === 'mentor' ? 'mentee' : 'mentor'
        }));
        
        setContacts(formattedContacts);
        console.log('Contacts loaded:', formattedContacts.length);
      } else {
        throw new Error(response.data.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive',
      });
    } finally {
      setLoadingContacts(false);
    }
  }, [userRole, toast]);


  // Start a new conversation with a contact
  const startConversation = useCallback((contact: Contact) => {
    // Set the active conversation
    setActiveConversation(contact._id);
    setActivePartnerName(contact.name);
    
    // Clear any existing messages
    setMessages([]);
    
    // Join the conversation room
    const conversationId = [userId, contact._id].sort().join('-');
    joinConversation(conversationId);
    
    // Check if this conversation already exists in the list
    const existingConversation = conversations.find(c => c.partnerId === contact._id);
    
    if (!existingConversation) {
      // Add a new conversation to the list
      const newConversation: Conversation = {
        partnerId: contact._id,
        lastMessage: '',
        lastMessageDate: new Date().toISOString(),
        unread: 0,
        partner: {
          name: contact.name,
          avatar: contact.avatar || '',
          role: contact.role
        }
      };
      
      setConversations(prev => [newConversation, ...prev]);
    }
  }, [conversations, joinConversation, userId]);

  // Initial data loading
  useEffect(() => {
    fetchConversations();
    fetchContacts();
  }, [fetchConversations, fetchContacts]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for incoming messages
    const handleIncomingMessage = (message: any) => {
      // Only process if it's for the current user
      if (message.receiverId === userId || message.senderId === userId) {
        // If it's from the active conversation, add to messages
        if (
          (activeConversation === message.senderId) || 
          (activeConversation === message.receiverId && message.senderId === userId)
        ) {
          // Check if we already have this message (to avoid duplicates)
          setMessages(prev => {
            if (!prev.some(m => m._id === message.messageId)) {
              return [...prev, {
                _id: message.messageId,
                sender: {
                  _id: message.senderId,
                  name: message.senderName || 'User',
                },
                receiver: {
                  _id: message.receiverId,
                  name: '',
                },
                text: message.text,
                createdAt: new Date().toISOString(),
                isRead: false,
              }];
            }
            return prev;
          });
        }
        
        // Update conversation list
        if (message.senderId !== userId) {
          setConversations(prev => {
            const updatedConversations = [...prev];
            const existingIndex = updatedConversations.findIndex(
              c => c.partnerId === message.senderId
            );
            
            if (existingIndex !== -1) {
              // Update existing conversation
              updatedConversations[existingIndex] = {
                ...updatedConversations[existingIndex],
                lastMessage: message.text,
                lastMessageDate: new Date().toISOString(),
                unread: activeConversation === message.senderId 
                  ? 0 
                  : updatedConversations[existingIndex].unread + 1,
              };
              
              // Move to top of list
              const [conversation] = updatedConversations.splice(existingIndex, 1);
              updatedConversations.unshift(conversation);
            } else {
              // Fetch user details and add new conversation
              // In a real app, you might want to fetch user details from an API
              // For now, we'll just add a placeholder
              updatedConversations.unshift({
                partnerId: message.senderId,
                lastMessage: message.text,
                lastMessageDate: new Date().toISOString(),
                unread: 1,
                partner: {
                  name: message.senderName || 'User',
                  avatar: '',
                  role: userRole === 'mentor' ? 'mentee' : 'mentor',
                },
              });
            }
            
            return updatedConversations;
          });
        }
      }
    };
    
    // Listen for typing indicators
    const handleTypingIndicator = (data: any) => {
      if (data.userId !== userId) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));
        
        // Auto-clear typing indicator after 3 seconds as a fallback
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: false,
            }));
          }, 3000);
        }
      }
    };
    
    socket.on('message', handleIncomingMessage);
    socket.on('typing', handleTypingIndicator);
    
    return () => {
      socket.off('message', handleIncomingMessage);
      socket.off('typing', handleTypingIndicator);
    };
  }, [socket, userId, activeConversation, userRole]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (isConnected && activeConversation) {
      const conversationId = [userId, activeConversation].sort().join('-');
      joinConversation(conversationId);
    }
  }, [isConnected, activeConversation, joinConversation, userId]);

  // Connection status alert
  const renderConnectionStatus = () => {
    if (socketError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Failed to connect to chat server. Messages will not be delivered in real-time.
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={connect}
            >
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    if (!isConnected) {
      return (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Connecting</AlertTitle>
          <AlertDescription>
            Connecting to chat server...
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {renderConnectionStatus()}
      
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Sidebar with Conversations and Contacts */}
          <div className="md:col-span-1 bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="conversations" className="h-full flex flex-col">
                <TabsList className="grid grid-cols-2 p-2 bg-gray-900/70">
                  <TabsTrigger 
                    value="conversations"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chats
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contacts"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    <Avatar className="h-4 w-4 mr-2">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    Contacts
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="conversations" className="flex-1 overflow-y-auto p-3">
                  {loadingConversations ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <motion.div
                          key={conversation.partnerId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`p-3 flex items-center space-x-3 rounded-md cursor-pointer transition-colors ${
                            activeConversation === conversation.partnerId
                              ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20'
                              : 'hover:bg-gray-800/60 border border-transparent'
                          }`}
                          onClick={() => handleSelectConversation(conversation.partnerId)}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.partner.avatar || '/placeholder.svg'} alt={conversation.partner.name} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                {conversation.partner.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unread > 0 && (
                              <span className="absolute -top-1 -right-1 bg-cyan-500 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium truncate">{conversation.partner.name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(conversation.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{conversation.lastMessage}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center p-4">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400 font-medium">
                          No conversations yet
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Start a new chat from the Contacts tab
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="contacts" className="flex-1 overflow-y-auto p-3">
                  {loadingContacts ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                  ) : contacts.length > 0 ? (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <motion.div
                          key={contact._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`p-3 flex items-center space-x-3 rounded-md cursor-pointer transition-colors ${
                            activeConversation === contact._id
                              ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20'
                              : 'hover:bg-gray-800/60 border border-transparent'
                          }`}
                          onClick={() => startConversation(contact)}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contact.avatar || '/placeholder.svg'} alt={contact.name} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                {contact.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-xs text-gray-400">
                              {contact.role === 'mentor' ? 'Mentor' : 'Mentee'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center p-4">
                        <Users className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400 font-medium">
                          No {userRole === 'mentor' ? 'mentees' : 'mentors'} found
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="md:col-span-2 bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-gray-800 bg-gray-900/70 flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-30"></div>
                    <Avatar className="h-10 w-10 relative">
                      <AvatarImage 
                        src={contacts.find(c => c._id === activeConversation)?.avatar || 
                             conversations.find(c => c.partnerId === activeConversation)?.partner.avatar || 
                             '/placeholder.svg'} 
                        alt={activePartnerName} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                        {activePartnerName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{activePartnerName}</h3>
                    {isConnected && (
                      <p className="text-xs text-cyan-400">
                        {typingUsers[activeConversation] ? 'Typing...' : 'Online'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    <ChatWindow
                      messages={messages}
                      loading={loadingMessages}
                      error={error}
                      currentUserId={userId}
                      partnerTyping={typingUsers[activeConversation] || false}
                      partnerName={activePartnerName}
                    />
                  </div>
                  
                  <div className="p-3 border-t border-gray-800 bg-gray-900/70">
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      onTyping={handleTyping}
                      disabled={!isConnected || loadingMessages}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-md">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-30"></div>
                    <div className="relative h-full w-full flex items-center justify-center bg-gray-900 rounded-full border border-cyan-500/30">
                      <MessageSquare className="h-10 w-10 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">No conversation selected</h3>
                  <p className="text-gray-400 mb-6">
                    Select a conversation from the list or start a new one from the Contacts tab.
                  </p>
                  <Button 
                    onClick={() => document.querySelector('data-[state="inactive"][value="contacts"]')}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Browse Contacts
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
