"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import LogoutButton from "@/components/logout-button"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Clock,
  CalendarIcon,
  Video,
  MessageSquare,
  ExternalLink,
  Home,
} from "lucide-react"
import axios from "axios"
import GradientSpinner from "@/components/ui/gradient-spinner"
import { cn } from "@/lib/utils"
import Chat from "@/components/chat/Chat"

interface Profile {
  id: string
  name: string
  email: string
  bio: string
  skills: string[]
  experience: string
  languages: string[]
  communicationPreference: string
  availability: { day: string; slots: string[] }[]
  profilePicture?: string
  rating: number
  reviewCount: number
}

interface Session {
  id: string
  menteeId: string
  menteeName: string
  menteeImage: string
  date: string
  duration: number
  topic: string
  status: string
}

// Format session date for display
const formatSessionDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export default function MentorDashboard() {
  const [profile, setProfile] = useState<Profile>({
    id: "",
    name: "",
    email: "",
    bio: "",
    skills: [],
    experience: "",
    languages: [],
    communicationPreference: "",
    availability: [],
    profilePicture: "",
    rating: 0,
    reviewCount: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [backendAvailable, setBackendAvailable] = useState(false)
  const { toast } = useToast()
const checkBackendStatus = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    try {
      await axios.get(`${backendUrl}/api/auth/test`, { timeout: 3000 });
      setBackendAvailable(true);
      return true;
    } catch (error) {
      setBackendAvailable(false);
      return false;
    }
  };
  
  // Add a function to test the connection on demand
  const testBackendConnection = async () => {
    toast({
      title: "Testing Connection",
      description: "Checking connection to backend server...",
    });
    
    try {
      const result = await checkBackendStatus();
      
      if (result) {
        toast({
          title: "Connection Successful",
          description: "Connected to backend server successfully!",
        });
        
        // Refresh data
        window.location.reload();
      } else {
        toast({
          title: "Connection Failed",
          description: "Cannot connect to backend server. Please make sure it's running on port 5001.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "An error occurred while checking the connection.",
        variant: "destructive",
      });
    }
  };

  // Fetch sessions from API
  const fetchSessions = async (token: string | null) => {
    try {
      console.log('Fetching mentor sessions...');
      
      // Call our Next.js API route for mentor sessions
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/mentor/sessions', { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sessions fetched successfully:', data);
      
      // Update state with the fetched sessions
      setUpcomingSessions(data);
      return data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error Fetching Sessions",
        description: "Could not load your upcoming sessions. Using sample data instead.",
        variant: "destructive",
      });
      
      // Use mock data for testing if API fails
      const mockSessions = [
        {
          id: "s1",
          menteeId: "mentee1",
          menteeName: "John Doe",
          menteeImage: "/placeholder.svg",
          date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          duration: 60,
          topic: "Introduction to Machine Learning",
          status: "scheduled"
        },
        {
          id: "s2",
          menteeId: "mentee2",
          menteeName: "Jane Smith",
          menteeImage: "/placeholder.svg",
          date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          duration: 45,
          topic: "Career Guidance in Tech",
          status: "scheduled"
        }
      ];
      
      setUpcomingSessions(mockSessions);
      return mockSessions;
    }
  };
  
  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First check if backend is available without authentication
        try {
          const backendTestUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
          await axios.get(`${backendTestUrl}/api/auth/test`, { timeout: 3000 });
          setBackendAvailable(true);
        } catch (testError) {
          setBackendAvailable(false);
          setLoading(false);
          toast({
            title: "Backend Server Unavailable",
            description: `Cannot connect to the backend server. Please ensure it's running at ${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}`,
            variant: "destructive",
          });
          // Continue anyway to show UI with mock data
        }
        
        // Get token from localStorage
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token');
          console.log("Token found in localStorage:", token ? "Yes" : "No");
        }
        
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          setLoading(false);
          
          // For testing, we'll still fetch sessions with mock data
          await fetchSessions(null);
          return;
        }
        
        // Ensure token is properly formatted (without extra quotes)
        if (token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1);
        }
        
        // Fetch sessions first to ensure they appear on the dashboard
        await fetchSessions(token);
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        
        console.log("Final request headers:", {
          Authorization: headers.Authorization.substring(0, 15) + '...',
          Accept: headers.Accept,
          ContentType: headers['Content-Type']
        });

        // Try direct API call first
        try {
          const directApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
          const response = await axios.get(`${directApiUrl}/api/mentors/profile`, { headers, timeout: 5000 });
          
          const { user, profile } = response.data.data;
          const transformedData = {
            id: user?.id || "",
            name: user?.name || "",
            email: user?.email || "",
            bio: profile?.bio || "",
            skills: Array.isArray(profile?.expertise) ? profile.expertise : [],
            languages: Array.isArray(profile?.languages) ? profile.languages : ["English"],
            availability: profile?.availability ? formatAvailability(profile.availability) : defaultAvailability(),
            experience: profile?.experience || "",
            hourlyRate: profile?.hourlyRate || 0,
            communicationPreference: profile?.communicationPreference || "Any",
            company: profile?.company || "",
            category: profile?.category || "Technology",
            socials: profile?.socials || {},
            rating: profile?.rating || 0,
            reviewCount: profile?.reviews || 0
          };
          
          setProfile(transformedData);
          setLoading(false);
          return;
          
        } catch (error: any) {
          // If direct API call fails, try Next.js API route
          try {
            const response = await axios.get('/api/mentors/profile', { headers });
            const mentorData = response.data;
            
            // Set default values for potentially missing fields
            const transformedData = {
              ...mentorData,
              bio: mentorData.bio || "",
              skills: Array.isArray(mentorData.skills) ? mentorData.skills : [], 
              languages: Array.isArray(mentorData.languages) ? mentorData.languages : ["English"],
              availability: mentorData.availability && Array.isArray(mentorData.availability) ? 
                mentorData.availability : defaultAvailability(),
              rating: mentorData.rating || 0,
              reviewCount: mentorData.reviewCount || 0
            };
            
            setProfile(transformedData);
            
          } catch (apiError: any) {
            throw new Error("Failed to fetch mentor profile");
          }
        }
        
        setLoading(false);
        
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load mentor data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  // Helper function to format availability from string to structured format
  const formatAvailability = (availabilityString: string) => {
    // Default structured availability
    const defaultAvail = defaultAvailability();
    
    try {
      // If it's already an array, return it
      if (Array.isArray(availabilityString)) {
        return availabilityString;
      }
      
      // Try to parse if it's a JSON string
      if (typeof availabilityString === 'string' && availabilityString.trim().startsWith('[')) {
        return JSON.parse(availabilityString);
      }
      
      // If it's just a text like "Flexible", create a basic structure
      return [
        {
          day: "Monday-Friday",
          slots: ["9:00 AM - 5:00 PM"]
        },
        {
          day: "Weekends",
          slots: ["By appointment"]
        }
      ];
    } catch (e) {
      console.error("Error parsing availability:", e);
      return defaultAvail;
    }
  };
  
  // Default availability structure
  const defaultAvailability = () => {
    return [
      {
        day: "Monday",
        slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
      },
      {
        day: "Tuesday",
        slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
      },
      {
        day: "Wednesday",
        slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
      },
      {
        day: "Thursday",
        slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
      },
      {
        day: "Friday",
        slots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"]
      }
    ];
  };

  // Format session date for display
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GradientSpinner size={64} />
      </div>
    )
  }
  
  // Display a message when backend is unavailable
  if (!backendAvailable && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-6 mt-12">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-8 max-w-lg text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Backend Server Unavailable</h2>
              <p className="text-gray-300 mb-6">
                Cannot connect to the backend server at <span className="font-mono bg-gray-800 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}</span>
              </p>
              <div className="space-y-4">
                <p className="text-gray-400">
                  Please ensure the backend server is running. Common issues:
                </p>
                <ul className="text-gray-400 text-left list-disc ml-8">
                  <li>Backend server is not started</li>
                  <li>Backend is running on a different port than 5001</li>
                  <li>Firewall is blocking the connection</li>
                  <li>CORS settings preventing access (check console for details)</li>
                </ul>
                <div className="pt-4">
                  <Button 
                    onClick={testBackendConnection}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <header className="absolute top-4 left-0 w-full h-14 bg-gray-900/50 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-70"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
                <span className="font-bold text-cyan-500">M</span>
              </div>
            </div>
            <span className="font-bold text-xl">MentorIQ</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" passHref>
              <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                <Home className="h-4 w-4 mr-2" />
                Home Page
              </Button>
            </Link>
            <LogoutButton variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950" />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Mentor Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your profile, sessions, and availability</p>
            </div>
            <div className="flex items-center space-x-4">
            <Link href="/dashboard/mentor/chat" passHref>
              <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                <ExternalLink className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link href={`/mentors/${profile.id}`} passHref>
              <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-900/50 p-1 rounded-lg">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <Video className="h-4 w-4 mr-2" />
                Upcoming Sessions
              </TabsTrigger>
              {/* <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <CardDescription>{profile.email}</CardDescription>
                    </div>
                    <div className="flex items-center bg-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(profile.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400">
                        {profile.rating.toFixed(1)} ({profile.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm text-gray-400">Professional Bio</Label>
                    <div className="bg-gray-800 border border-gray-700 rounded-md p-4 text-gray-200 min-h-[120px]">
                      {profile.bio || "No professional bio available."}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="skills" className="text-sm text-gray-400">Skills & Expertise</Label>
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-gray-800 border-gray-700"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length === 0 && (
                            <p className="text-gray-500 text-sm">No skills listed</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="languages" className="text-sm text-gray-400">Languages</Label>
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profile.languages.map((language, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-gray-800 border-gray-700"
                            >
                              {language}
                            </Badge>
                          ))}
                          {profile.languages.length === 0 && (
                            <p className="text-gray-500 text-sm">No languages listed</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="communication" className="text-sm text-gray-400">Preferred Communication</Label>
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                        {profile.communicationPreference || "Not specified"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-sm text-gray-400">Experience</Label>
                      <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                        {profile.experience || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-6 mt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-cyan-400">Availability</h3>
                      <p className="text-sm text-gray-400">Your current availability for mentoring sessions</p>
                    </div>
                  
                    <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                      {profile.availability.length > 0 ? (
                        <div className="space-y-4">
                          {profile.availability.map((day, dayIndex) => (
                            <div key={dayIndex} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
                              <h5 className="text-sm font-medium text-cyan-400 mb-2">{day.day}</h5>
                              <div className="flex flex-wrap gap-2">
                                {day.slots.map((slot, slotIndex) => (
                                  <Badge
                                    key={slotIndex}
                                    variant="outline"
                                    className="bg-gray-700 border-gray-600"
                                  >
                                    {slot}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No availability set yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-400">Upcoming Sessions</CardTitle>
                      <CardDescription>Your scheduled mentoring sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {upcomingSessions.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingSessions.map((session) => (
                            <div
                              key={session.id}
                              className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Avatar>
                                    <AvatarFallback>{session.menteeName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">{session.menteeName}</h4>
                                    <p className="text-sm text-gray-400">{session.topic}</p>
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    session.status === "confirmed"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }
                                >
                                  {session.status === "confirmed" ? "Confirmed" : "Pending"}
                                </Badge>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-400">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>{formatSessionDate(session.date)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Clock className="h-4 w-4" />
                                  <span>{session.duration} minutes</span>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2 items-center">
                                <Link href="https://meet.google.com/bfy-jzcd-hxv" target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Session
                                  </Button>
                                </Link>
                                <Link href="/dashboard/mentor/chat">
                                <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No sessions scheduled</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-400">Calendar</CardTitle>
                      <CardDescription>View your schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="sessions">
                        <TabsList className="grid grid-cols-2 gap-2">
                          <TabsTrigger value="sessions">Sessions</TabsTrigger>
                          <TabsTrigger value="availability">Availability</TabsTrigger>
                        </TabsList>
                        <TabsContent value="sessions">
                          <div className="relative border border-gray-800 bg-gray-900/50">
                              <div className="absolute bg-gray-900/50 rounded-md" />
                              <h4 className="font-medium mb-3 text-cyan-400 text-center mt-2">
                                    {new Date().toLocaleDateString("en-US", {
                                    
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </h4>
                              <div className="grid grid-cols-7 gap-2 text-center">
                                {[...Array(35)].map((_, i) => (
                                  <div key={i} className="h-8 flex items-center justify-center">
                                    <span
                                      className={cn(
                                        i % 7 === 0 || i % 7 === 6
                                          ? "text-gray-500"
                                          : "text-white",
                                        i === 14 ? "font-bold" : ""
                                      )}
                                    >
                                      {i + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="availability">
                        <div className="relative border border-gray-800 bg-gray-900/50">
                        <div className="absolute bg-gray-900/50 rounded-md" />
                        <h4 className="font-medium mb-3 text-cyan-400 text-center mt-2">
                          {new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h4>
                              <div className="grid grid-cols-7 gap-2 text-center">
                                {[...Array(35)].map((_, i) => (
                                  <div key={i} className="h-8 flex items-center justify-center">
                                    <span
                                      className={cn(
                                        i % 7 === 0 || i % 7 === 6
                                          ? "text-gray-500"
                                          : "text-white",
                                        i === 14 ? "font-bold" : ""
                                      )}
                                    >
                                      {i + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                        </TabsContent>
                      </Tabs>

                      <div className="mt-6 bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                        <h4 className="font-medium mb-3 text-cyan-400">
                          {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>

                        {upcomingSessions.filter((session) => {
                          const sessionDate = new Date(session.date)
                          return (
                            new Date().getDate() === sessionDate.getDate() &&
                            new Date().getMonth() === sessionDate.getMonth() &&
                            new Date().getFullYear() === sessionDate.getFullYear()
                          )
                        }).length > 0 ? (
                          <div className="space-y-3">
                            {upcomingSessions
                              .filter((session) => {
                                const sessionDate = new Date(session.date)
                                return (
                                  new Date().getDate() === sessionDate.getDate() &&
                                  new Date().getMonth() === sessionDate.getMonth() &&
                                  new Date().getFullYear() === sessionDate.getFullYear()
                                )
                              })
                              .map((session) => (
                                <div key={session.id} className="bg-gray-800/80 rounded p-3 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                                  <p className="font-medium text-sm">{session.topic}</p>
                                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>
                                      {new Date(session.date).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span>with {session.menteeName}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">No sessions scheduled for this day</p>
                            <p className="text-gray-600 text-xs mt-1">Select another date or add a new session</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* <TabsContent value="messages">
              <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-cyan-400">Messages</CardTitle>
                  <CardDescription>Communication with your mentees</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link className="w-full flex justify-center items-center border-gray-700 border rounded-lg p-4" href="/dashboard/mentor/chat">
                    <Button className="w-full text-white font-semibold hover:text-gray-200 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">Chat</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
    
  );
} 