"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import LogoutButton from "@/components/logout-button"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  CalendarIcon,
  Video,
  MessageSquare,
  Search,
  Filter,
  Star,
  ArrowRight,
  Sparkles,
  Clock,Home
} from "lucide-react"
import axios from "axios"
import GradientSpinner from "@/components/ui/gradient-spinner"

// Interface definitions for the data structures used in this component

interface Mentor {
  id: string
  name: string
  role: string
  company: string
  image: string
  rating: number
  reviews: number
  expertise: string[]
  matchScore: number
}

interface Session {
  mentorEmail: string
  id: string
  mentorId: string
  mentorName: string
  mentorImage: string
  date: string
  duration: number
  topic: string
  status: string
}

interface Profile {
  id: string
  name: string
  email: string
  interests: string[]
  goals: string
  preferredLanguages: string[]
  profilePicture: string
}

export default function MenteeDashboard() {
  const [profile, setProfile] = useState<Profile>({
    id: "",
    name: "",
    email: "",
    interests: [],
    goals: "",
    preferredLanguages: [],
    profilePicture: "",

  })
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [recommendedMentors, setRecommendedMentors] = useState<Mentor[]>([])
  const [allMentors, setAllMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([])
  const { toast } = useToast()

  // Fetch data from API — run once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token');
        }
        
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 1. Profile
        let userId = '';
        try {
          const profileResponse = await axios.get('/api/auth/me', { headers });
          const menteeData = profileResponse.data;
          if (menteeData && menteeData.success !== false) {
            userId = menteeData.data?.user?._id || menteeData.id || '';
            setProfile({
              id: userId,
              name: menteeData.data?.user?.name || menteeData.name || "",
              email: menteeData.data?.user?.email || menteeData.email || "",
              interests: menteeData.data?.profile?.interests || menteeData.interests || [],
              goals: menteeData.data?.profile?.goals || menteeData.goals || "",
              preferredLanguages: menteeData.data?.profile?.preferredLanguages || [],
              profilePicture: menteeData.data?.user?.avatar || "",
            });
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        // 2. Sessions
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
          const sessionsResponse = await axios.get(`${backendUrl}/api/sessions`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (sessionsResponse.data?.data && Array.isArray(sessionsResponse.data.data)) {
            const formattedSessions = sessionsResponse.data.data.map((session: any) => ({
              id: session._id,
              mentorId: session.mentor?._id || session.mentor,
              mentorName: session.mentor?.name || 'Unknown Mentor',
              mentorEmail: session.mentor?.email || '',
              mentorImage: session.mentor?.avatar || '',
              date: session.date,
              duration: session.duration,
              topic: session.title,
              status: session.status
            }));
            setUpcomingSessions(formattedSessions);
          }
        } catch (sessionsError) {
          console.error("Error fetching sessions:", sessionsError);
        }

        // 3. Recommended mentors
        try {
          if (userId) {
            const recommendedResponse = await axios.get(`/api/match/${userId}`, { headers });
            if (Array.isArray(recommendedResponse.data)) {
              setRecommendedMentors(recommendedResponse.data);
            }
          }
        } catch (recommendedError) {
          console.error("Error fetching recommended mentors:", recommendedError);
        }

        // 4. All mentors
        try {
          const allMentorsResponse = await axios.get('/api/mentors', { headers });
          if (allMentorsResponse.data?.mentors) {
            setAllMentors(allMentorsResponse.data.mentors);
          }
        } catch (mentorsError) {
          console.error("Error fetching all mentors:", mentorsError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]); // only run once on mount

  // Filter mentors based on search term and selected skills
  useEffect(() => {
    let filtered = [...allMentors]

    if (searchTerm) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.expertise.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter((mentor) => selectedSkills.some((skill) => mentor.expertise.includes(skill)))
    }

    setFilteredMentors(filtered)
  }, [searchTerm, selectedSkills, allMentors])

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

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  // Get all unique skills from all mentors
  const allSkills = Array.from(new Set(allMentors.flatMap((mentor) => mentor.expertise)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GradientSpinner size={64} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pb-16 pt-16">
      
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
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold">Mentee Dashboard</h1>

          {/* Upcoming Sessions Section */}
          <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800">
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled mentoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            {session.mentorImage ? (
                              <AvatarImage src={session.mentorImage} alt={session.mentorName || 'Mentor'} />
                            ) : (
                              <AvatarFallback>{session.mentorName ? session.mentorName.charAt(0) : 'M'}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{session.mentorName}</h4>
                            <p className="text-sm text-gray-400">{session.topic}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">
                          Confirmed
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
                      <div className="mt-3 flex gap-2">
                     
                        
                         
                         
                        <a href={`https://meet.google.com/new`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                        </a>
                        
                        {/* <Button variant="outline" className="border-gray-700 hover:bg-gray-800"
                        onClick={() => window.open(`mailto:${session.mentorEmail || "contact@mentorai.com"}`)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button> */}
                        <Link href={`/dashboard/mentee/chat`}>
                        <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                  <p className="text-gray-400 mb-4">You don't have any scheduled sessions yet.</p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                    Find a Mentor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentors Section */}
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 bg-gray-900/50 p-1 rounded-lg">
              <TabsTrigger
                value="recommended"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recommended Mentors
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <User className="h-4 w-4 mr-2" />
                Browse All Mentors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommended">
              <div className="space-y-6">
                <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">AI-Matched Mentors for You</h3>
                  <p className="text-gray-400 mb-6">
                    Based on your profile, interests, and goals, we've found these mentors who would be a great match
                    for you.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendedMentors.map((mentor, index) => (
                      <motion.div
                        key={mentor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group"
                      >
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-md opacity-70"></div>
                              <Avatar className="h-16 w-16 border-2 border-gray-700">
                                {/* <AvatarImage src={mentor.image} alt={mentor.name || 'Mentor'} /> */}
                                <AvatarFallback>{mentor.name ? mentor.name.charAt(0) : 'M'}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <h4 className="font-bold">{mentor.name}</h4>
                              <p className="text-sm text-gray-400">
                                {mentor.role} at {mentor.company}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">
                              {mentor.rating} ({mentor.reviews} reviews)
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {mentor.expertise.map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  variant="outline"
                                  className="bg-gray-700/50 border-gray-600 text-gray-300"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-cyan-950/30 rounded-lg px-3 py-1 border border-cyan-500/30">
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-cyan-400" />
                                <span className="text-cyan-400 font-medium">{mentor.matchScore}% Match</span>
                              </div>
                            </div>
                          </div>

                          <Link href={`/mentors/${mentor.id}`} passHref>
                            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                              View Profile
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-6">
                <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name, role, or expertise..."
                        className="pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" className="border-gray-700 hover:border-cyan-500 hover:bg-gray-800">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Filter by Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {allSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`cursor-pointer ${
                            selectedSkills.includes(skill)
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                          }`}
                          onClick={() => toggleSkillFilter(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {filteredMentors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredMentors.map((mentor, index) => (
                        <motion.div
                          key={mentor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 group"
                        >
                          <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-md opacity-70"></div>
                                <Avatar className="h-16 w-16 border-2 border-gray-700">
                                  {/* <AvatarImage src={mentor.image} alt={mentor.name || 'Mentor'} /> */}
                                  <AvatarFallback>{mentor.name ? mentor.name.charAt(0) : 'M'}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <h4 className="font-bold">{mentor.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {mentor.role} at {mentor.company}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-400">
                                {mentor.rating} ({mentor.reviews} reviews)
                              </span>
                            </div>

                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {mentor.expertise.map((skill, skillIndex) => (
                                  <Badge
                                    key={skillIndex}
                                    variant="outline"
                                    className="bg-gray-700/50 border-gray-600 text-gray-300"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Link href={`/mentors/${mentor.id}`} passHref>
                              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
                                View Profile
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                      <p className="text-gray-400 mb-4">Try adjusting your search or filters to find mentors.</p>
                      <Button
                        variant="outline"
                        className="border-cyan-500 text-cyan-500 hover:bg-cyan-950"
                        onClick={() => {
                          setSearchTerm("")
                          setSelectedSkills([])
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

