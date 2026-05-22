import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

interface NewConversationProps {
  userRole: 'mentor' | 'mentee';
  onSelectUser: (userId: string, userName: string, userAvatar?: string) => void;
  onCancel: () => void;
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
  role: 'mentor' | 'mentee';
}

export default function NewConversation({ userRole, onSelectUser, onCancel }: NewConversationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users based on the current user's role
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const formattedToken = token.startsWith('"') && token.endsWith('"') 
          ? token.slice(1, -1) 
          : token;
        
        // If current user is a mentor, fetch mentees, and vice versa
        const endpoint = userRole === 'mentor' 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/mentees` 
          : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/mentors`;
        
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        });
        
        if (response.data.success) {
          // Transform the data to a consistent format
          const formattedUsers = response.data.data.map((user: any) => ({
            _id: user._id,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatar: user.profilePicture || user.avatar,
            role: userRole === 'mentor' ? 'mentee' : 'mentor'
          }));
          
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        } else {
          throw new Error(response.data.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [userRole]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle user selection
  const handleSelectUser = (user: User) => {
    onSelectUser(user._id, user.name, user.avatar);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Start New Conversation</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search ${userRole === 'mentor' ? 'mentees' : 'mentors'}...`}
          className="pl-9"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="p-3 bg-muted/50 border-b">
          <h4 className="font-medium text-sm">
            {userRole === 'mentor' ? 'Your Mentees' : 'Available Mentors'}
          </h4>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div 
                  key={user._id}
                  className="p-3 flex items-center space-x-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || '/placeholder.svg'} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role === 'mentor' ? 'Mentor' : 'Mentee'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No users found matching your search'
                  : `No ${userRole === 'mentor' ? 'mentees' : 'mentors'} available`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
