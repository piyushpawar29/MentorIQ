"use client";

import React, { useState, useEffect } from 'react';
import Chat from '@/components/chat/Chat';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import GradientSpinner from '@/components/ui/gradient-spinner';
import { Button } from '@/components/ui/button';

export default function MentorChatPage() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    role: 'mentor' | 'mentee';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
         const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const formattedToken = token.startsWith('"') && token.endsWith('"') 
          ? token.slice(1, -1) 
          : token;
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/mentors/profile`, {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        });

        if (response.data.success) {
          setUser({
            id: response.data.data._id,
            name: `${response.data.data.firstName} ${response.data.data.lastName}`,
            avatar: response.data.data.profilePicture,
            role: 'mentor',
          });
        } else {
          throw new Error(response.data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to authenticate. Please log in again.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GradientSpinner size={64} />
      </div>
    )
  }


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <div className="flex items-center justify-between mb-4">  
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" onClick={() => router.push('/mentor/dashboard')}>Back</Button>
      </div>
      <div className="h-[calc(100%-3rem)] border rounded-lg overflow-hidden">
        <Chat 
          userId={user.id}
          userName={user.name}
          userAvatar={user.avatar}
          userRole={user.role}
        />
      </div>
    </div>
  );
}
