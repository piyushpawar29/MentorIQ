"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import LogoutButton from "@/components/logout-button"
import {
  ArrowLeft,
  Calendar,
  Star,
  Clock,
  Briefcase,
  MapPin,
  Globe,
  Video,
  MessageSquare,
  Share2,
  Heart,
  Linkedin,
  Github,
  Twitter,
  XCircle,
  Info as InfoIcon,
  Users,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Link,
  Home as HomeIcon,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import BookingCalendar from "./booking-calendar"
import ReviewForm from "./review-form"
import MentorshipJourney from "./mentorship-journey"
import MentorSkillChart from "./mentor-skill-chart"
import MentorshipStats from "./mentorship-stats"
import { useToast } from "@/hooks/use-toast"
import Home from "@/app/page"
import { format, parse } from "date-fns"
import axios from "axios"
import GradientSpinner from "@/components/ui/gradient-spinner"

interface MentorProfilePageProps {
  mentorId: string
}

export default function MentorProfilePage({ mentorId }: MentorProfilePageProps) {
  const [mentor, setMentor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch mentor data
  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true)
        
        // Import the mentorAPI from our utility
        const { mentorAPI } = await import('@/lib/api')
        
        // Fetch the mentor by ID using our API utility
        const response = await mentorAPI.getMentor(mentorId)
        const responseData = response.data
        
        // Check if the response has the expected structure
        if (!responseData.success) {
          throw new Error(responseData.message || 'Failed to fetch mentor data')
        }
        
        // Extract mentor from the nested data structure
        // The backend returns { success: true, data: { mentor, reviews } }
        const { mentor, reviews } = responseData.data
        
        // Check if mentor and user data exist
        if (!mentor) {
          throw new Error('Mentor data is missing')
        }
        
        // Safely extract data with fallbacks
        const mentorData = {
          id: mentor._id || mentorId,
          userId: mentor.user?._id, // Store the user ID separately for API calls
          name: mentor.user?.name || 'Anonymous Mentor',
          email: mentor.user?.email || '',
          avatar: mentor.user?.avatar || '/placeholder.svg',
          image: mentor.user?.avatar,
          role: mentor.role || 'Mentor',
          company: mentor.company || 'Company',
          hourlyRate: mentor.hourlyRate || 75,
          expertise: mentor.expertise || [],
          languages: mentor.languages || ['English'],
          experience: mentor.experience || '',
          yearsOfExperience: mentor.yearsOfExperience || 5,
          availability: mentor.availability || 'Flexible',
          category: mentor.category || 'Technology',
          communicationPreference: mentor.communicationPreference || 'Any',
          rating: mentor.rating || 0,
          reviews: reviews || [],
          bio: mentor.user?.bio || '',
          isAvailable: true, // Default value as this might not be in the backend model
          socials: mentor.socials || {},
          industry: mentor.category || 'Technology',
          location: mentor.location || 'Remote'
        }

        // Log the mentor data with the user ID for debugging
        console.log('Mentor data successfully retrieved:', mentorData)
        console.log('Mentor user ID for reviews:', mentor.user?._id)
        
        // Store the raw user ID directly in the component state for use in the review form
        setMentor({
          ...mentorData,
          userId: mentor.user?._id // Ensure the user ID is correctly stored
        })
      } catch (err) {
        setError("Failed to load mentor profile. Please try again later.")
        console.error('Error fetching mentor:', err)
        
        // Instead of using mock data, show proper error message to the user
        toast({
          title: "Error Loading Profile",
          description: "We couldn't load this mentor's profile. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [mentorId])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "This mentor has been removed from your favorites"
        : "This mentor has been added to your favorites",
      variant: isFavorite ? "destructive" : "default",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mentor.name} - MentorAI`,
          text: `Check out ${mentor.name}, a mentor on MentorAI`,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "The profile link has been copied to your clipboard",
      })
    }
  }

  // Handle booking form submission
  const handleBookingSubmit = async () => {
    if (!selectedSessionType || !selectedDate || !selectedTime || !mentor) {
      toast({
        title: "Missing information",
        description: "Please select a session type, date and time",
        variant: "destructive",
      })
      return
    }
    
    // Get token from localStorage
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      
      // Also set token in cookie for server-side access
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      }
    }
    
    // For testing, we'll continue even without a token
    // In production, you would want to require authentication
    if (!token) {
      console.warn("No authentication token found, continuing anyway for testing");
    }
    
    try {
      setIsSubmitting(true)
      
      // Get the session details based on the selected type
      const sessionTypes = [
        {
          id: "1on1",
          name: "1:1 Video Session",
          duration: 60, // minutes
          price: mentor.hourlyRate || 100,
        },
        {
          id: "text",
          name: "Text Consultation",
          duration: 10080, // 7 days in minutes
          price: (mentor.hourlyRate || 100) * 3,
        },
        {
          id: "group",
          name: "Group Session",
          duration: 90, // minutes
          price: (mentor.hourlyRate || 100) * 0.6,
        },
        {
          id: "code",
          name: "Code Review",
          duration: 45, // minutes
          price: (mentor.hourlyRate || 100) * 0.8,
        },
      ]
      
      const selectedSession = sessionTypes.find(session => session.id === selectedSessionType)
      
      if (!selectedSession) {
        throw new Error("Invalid session type")
      }
      
      // Format date and time for API
      let bookingDate: Date
      try {
        // Parse the time string (e.g., "10:00 AM")
        const timeRegex = /(\d+):(\d+)\s*([AP]M)/i
        const match = selectedTime.match(timeRegex)
        
        if (!match) {
          throw new Error("Invalid time format")
        }
        
        let [_, hours, minutes, period] = match
        let hoursNum = parseInt(hours, 10)
        
        // Convert to 24-hour format
        if (period.toUpperCase() === "PM" && hoursNum < 12) {
          hoursNum += 12
        } else if (period.toUpperCase() === "AM" && hoursNum === 12) {
          hoursNum = 0
        }
        
        // Create a new date object with the selected date and time
        bookingDate = new Date(selectedDate)
        bookingDate.setHours(hoursNum, parseInt(minutes, 10), 0, 0)
      } catch (error) {
        console.error("Error parsing time:", error)
        toast({
          title: "Invalid time format",
          description: "Please select a valid time",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
      
      // Prepare the request payload
      const requestPayload = {
        mentorUserId: mentor.id, // Use mentorUserId as expected by the API route
        title: selectedSession.name,
        description: additionalInfo || `${selectedSession.name} with ${mentor.name}`,
        date: bookingDate.toISOString(),
        duration: selectedSession.duration,
        communicationType: selectedSession.id === 'text' ? 'Chat' : 'Video Call'
      };
      
      console.log("Sending session booking request:", requestPayload);
      
      // Use direct fetch to the Next.js API route instead of the utility
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(requestPayload)
      });
      
      const responseData = await response.json();
      
      console.log("Session booking response:", response.status, responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to book session');
      }
      
      // Show success toast
      toast({
        title: "Booking successful!",
        description: `Your session with ${mentor.name} has been scheduled.`,
      });
      
      // Close the dialog and reset form state
      setShowBookingDialog(false);
      setSelectedSessionType(null);
      setSelectedDate(new Date());
      setSelectedTime(null);
      setAdditionalInfo("");
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <GradientSpinner size={64} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 pb-16 flex items-center justify-center">
        <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-8 max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push("/mentors")}>Browse Other Mentors</Button>
        </div>
      </div>
    )
  }

  // If mentor data is loaded successfully
  if (mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-6 pb-16">
       <div className="absolute top-4 left-0 w-full h-14 bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="container mx-auto px-4 flex items-center justify-between">
             <a href="/" className="flex items-center gap-2 z-50">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-70"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
                <span className="font-bold text-cyan-500">M</span>
              </div>
            </div>
            <span className="font-bold text-xl">MentorIQ</span>
          </a>
              <div className="flex items-center space-x-4">
                <a href="/">
                  <Button variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950">
                    Home Page
                  </Button>
                </a>
                <LogoutButton variant="outline" className="border-cyan-500 text-cyan-500 hover:bg-cyan-950" />
                </div>
              </div>
            </div>

        {/* Back button */}
        <div className="container mx-auto px-4 mb-4 mt-14">
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar - Mentor profile card */}
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6 sticky top-24"
              >
                <div className="flex flex-col items-center">
                  {/* Profile image with availability indicator */}
                  {/* <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-md opacity-70"></div>
                    <div className="relative">
                      <Image
                        src={mentor.image || "/placeholder.svg?height=160&width=160"}
                        width={160}
                        height={160}
                        alt="Mentor Profile Image"
                        className="rounded-full border-2 border-gray-800 object-cover"
                      />
                      <div
                        className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-gray-900 ${mentor.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                    </div>
                  </div> */}

                  {/* Name and title */}
                  <h1 className="text-2xl font-bold mb-1">{mentor.name}</h1>
                  <p className="text-gray-400 mb-4">
                    {mentor.role} at {mentor.company}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(mentor.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">
                      {mentor.rating || 0} ({mentor.reviews?.length || 0} reviews)
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col w-full gap-3 mb-6">
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                      onClick={() => setShowBookingDialog(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book a Session
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-gray-700 hover:bg-gray-800"
                      onClick={() => window.open(`mailto:${mentor.email || "contact@mentorai.com"}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>

                  {/* Quick actions */}
                  <div className="flex justify-center gap-4 mb-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-gray-800"
                      onClick={toggleFavorite}
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-gray-800"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5 text-gray-400" />
                      <span className="sr-only">Share profile</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-gray-800"
                      onClick={() => setShowReviewDialog(true)}
                    >
                      <Star className="h-5 w-5 text-gray-400" />
                      <span className="sr-only">Leave a review</span>
                    </Button>
                  </div>

                  {/* Key info */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-cyan-950/50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Experience</p>
                        <p className="font-medium">{mentor.yearsOfExperience} years</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-950/50 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Industry</p>
                        <p className="font-medium">{mentor.industry || mentor.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-950/50 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Location</p>
                        <p className="font-medium">{mentor.location || "Remote"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-950/50 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Languages</p>
                        <p className="font-medium">{mentor.languages?.join(", ") || "English"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social links */}
                  {/* <div className="w-full mt-6 pt-6 border-t border-gray-800">
                    <h3 className="text-sm uppercase text-gray-500 mb-4">Connect</h3>
                    <div className="flex gap-3">
                      {mentor.linkedin && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-gray-700 hover:bg-gray-800 hover:border-blue-500"
                          onClick={() => window.open(mentor.linkedin, "_blank")}
                        >
                          <Linkedin className="h-5 w-5 text-blue-500" />
                        </Button>
                      )}

                      {mentor.github && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-gray-700 hover:bg-gray-800 hover:border-gray-400"
                          onClick={() => window.open(mentor.github, "_blank")}
                        >
                          <Github className="h-5 w-5 text-gray-400" />
                        </Button>
                      )}

                      {mentor.twitter && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-gray-700 hover:bg-gray-800 hover:border-blue-400"
                          onClick={() => window.open(mentor.twitter, "_blank")}
                        >
                          <Twitter className="h-5 w-5 text-blue-400" />
                        </Button>
                      )}

                      {mentor.website && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-gray-700 hover:bg-gray-800 hover:border-purple-500"
                          onClick={() => window.open(mentor.website, "_blank")}
                        >
                          <Globe className="h-5 w-5 text-purple-500" />
                        </Button>
                      )}
                    </div>
                  </div> */}
                </div>
              </motion.div>
            </div>

            {/* Right content area */}
            <div className="lg:w-2/3">
              {/* Tabs navigation */}
              <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-8 bg-gray-900/50 p-1 rounded-lg">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="expertise"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    Expertise
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger
                    value="sessions"
                    className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
                  >
                    Sessions
                  </TabsTrigger>
                </TabsList>

                {/* Overview tab */}
                <TabsContent value="overview">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    {/* Bio section */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">About {mentor.name}</h2>
                      <p className="text-gray-300 whitespace-pre-line">
                        {mentor.bio ||
                          `${mentor.name} is an experienced ${mentor.role} with a passion for mentoring others in the field of ${mentor.category || "technology"}. With ${mentor.yearsOfExperience} years of industry experience, they provide valuable insights and guidance to help mentees achieve their career goals.`}
                      </p>

                      {/* Expertise tags */}
                      <div className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 mb-3">Areas of Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise?.map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mentorship stats */}
                    <MentorshipStats mentor={mentor} />

                    {/* Mentorship journey */}
                    <MentorshipJourney mentor={mentor} />

                    {/* Featured reviews */}
                    {mentor.reviews && mentor.reviews.length > 0 && (
                      <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">Featured Reviews</h2>
                          <Button
                            variant="link"
                            className="text-cyan-400 p-0 hover:text-cyan-300"
                            onClick={() => setActiveTab("reviews")}
                          >
                            View all
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {mentor.reviews.slice(0, 2).map((review: any, index: number) => (
                            <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar>
                                  <AvatarImage src={review.user?.image || ""} />
                                  <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{review.user?.name || "Anonymous User"}</p>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-400">
                                      {new Date(review.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-300">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                {/* Expertise tab */}
                <TabsContent value="expertise">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    {/* Skills chart */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-6">Skills & Expertise</h2>
                      <MentorSkillChart mentor={mentor} />
                    </div>

                    {/* Detailed expertise */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">Areas of Expertise</h2>
                      <div className="space-y-6">
                        {mentor.expertiseDetails?.map((area: any, index: number) => (
                          <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                            <h3 className="font-bold text-lg mb-2">{area.name}</h3>
                            <p className="text-gray-300 mb-3">{area.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {area.skills?.map((skill: string, skillIndex: number) => (
                                <Badge
                                  key={skillIndex}
                                  variant="outline"
                                  className="bg-gray-800/50 border-gray-700 text-gray-300"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )) ||
                          mentor.expertise?.map((skill: string, index: number) => (
                            <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                              <h3 className="font-bold text-lg mb-2">{skill}</h3>
                              <p className="text-gray-300 mb-3">
                                {mentor.name} has extensive experience in {skill.toLowerCase()}.
                              </p>
                              <Progress value={75 + Math.random() * 25} className="h-2 bg-gray-800" />
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">Certifications & Education</h2>
                      <div className="space-y-4">
                        {mentor.certifications?.map((cert: any, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-950/50 flex items-center justify-center shrink-0 mt-1">
                              <Award className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-medium">{cert.name}</h3>
                              <p className="text-gray-400 text-sm">
                                {cert.issuer} • {cert.year}
                              </p>
                            </div>
                          </div>
                        )) ||
                          [
                            {
                              name: `${mentor.category || "Technology"} Professional Certification`,
                              issuer: "Industry Association",
                              year: "2021",
                            },
                            { name: `Advanced ${mentor.role} Training`, issuer: mentor.company, year: "2020" },
                            {
                              name: `Bachelor's Degree in Computer Science`,
                              issuer: "University of Technology",
                              year: "2015",
                            },
                          ].map((cert, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-950/50 flex items-center justify-center shrink-0 mt-1">
                                <Award className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-medium">{cert.name}</h3>
                                <p className="text-gray-400 text-sm">
                                  {cert.issuer} • {cert.year}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Work experience
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-4">Work Experience</h2>
                      <div className="space-y-6">
                        {mentor.experience?.map((exp: any, index: number) => (
                          <div key={index} className="relative pl-8 pb-6 last:pb-0">
                            {index < (mentor.experience?.length || 0) - 1 && (
                              <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gray-800"></div>
                            )}
                            <div className="absolute left-0 top-3 h-6 w-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                            </div>
                            <div>
                              <h3 className="font-bold">{exp.role}</h3>
                              <p className="text-gray-400 mb-2">
                                {exp.company} • {exp.period}
                              </p>
                              <p className="text-gray-300">{exp.description}</p>
                            </div>
                          </div>
                        )) ||
                          [
                            {
                              role: mentor.role,
                              company: mentor.company,
                              period: `2020 - Present`,
                              description: `Working as a ${mentor.role} at ${mentor.company}, focusing on ${mentor.expertise?.[0] || mentor.category}.`,
                            },
                            {
                              role: `Senior ${mentor.role.includes("Senior") ? mentor.role.replace("Senior ", "") : mentor.role}`,
                              company: "Previous Company",
                              period: "2017 - 2020",
                              description: `Led projects and mentored junior team members.`,
                            },
                          ].map((exp, index) => (
                            <div key={index} className="relative pl-8 pb-6 last:pb-0">
                              {index < 1 && <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gray-800"></div>}
                              <div className="absolute left-0 top-3 h-6 w-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                              </div>
                              <div>
                                <h3 className="font-bold">{exp.role}</h3>
                                <p className="text-gray-400 mb-2">
                                  {exp.company} • {exp.period}
                                </p>
                                <p className="text-gray-300">{exp.description}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div> */}
                  </motion.div>
                </TabsContent>

                {/* Reviews tab */}
                <TabsContent value="reviews">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    {/* Rating summary */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3 flex flex-col items-center justify-center">
                          <div className="text-5xl font-bold mb-2">{mentor.rating || 0}</div>
                          <div className="flex mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.floor(mentor.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-400">{mentor.reviews?.length || 0} reviews</p>
                        </div>

                        <div className="md:w-2/3">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = mentor.reviews?.filter((r: any) => r.rating === rating).length || 0
                              const percentage = mentor.reviews?.length ? (count / mentor.reviews.length) * 100 : 0

                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <div className="flex items-center w-12">
                                    <span>{rating}</span>
                                    <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-12 text-right text-gray-400">{count}</div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="mt-6">
                            <Button
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                              onClick={() => setShowReviewDialog(true)}
                            >
                              Write a Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-6">All Reviews</h2>

                      {mentor.reviews && mentor.reviews.length > 0 ? (
                        <div className="space-y-6">
                          {(showAllReviews ? mentor.reviews : mentor.reviews.slice(0, 5)).map(
                            (review: any, index: number) => (
                              <div key={index} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar>
                                    <AvatarImage src={review.user?.image || ""} />
                                    <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{review.user?.name || "Anonymous User"}</p>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                                        />
                                      ))}
                                      <span className="ml-2 text-sm text-gray-400">
                                        {new Date(review.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-300">{review.comment}</p>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 mb-4">
                            <Star className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                          <p className="text-gray-400 mb-6">Be the first to review {mentor.name}</p>
                          <Button
                            variant="outline"
                            className="border-cyan-500 text-cyan-500 hover:bg-cyan-950"
                            onClick={() => setShowReviewDialog(true)}
                          >
                            Write a Review
                          </Button>
                        </div>
                      )}

                      {mentor.reviews && mentor.reviews.length > 5 && !showAllReviews && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="ghost"
                            className="text-cyan-400 hover:text-cyan-300"
                            onClick={() => setShowAllReviews(true)}
                          >
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show all reviews
                          </Button>
                        </div>
                      )}

                      {showAllReviews && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="ghost"
                            className="text-cyan-400 hover:text-cyan-300"
                            onClick={() => setShowAllReviews(false)}
                          >
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show less
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Sessions tab */}
                <TabsContent value="sessions">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                  >
                    {/* Session types */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-6">Session Types</h2>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-cyan-950/50 flex items-center justify-center">
                              <Video className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="font-bold">1:1 Video Session</h3>
                              <p className="text-sm text-gray-400">60 minutes</p>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Personal video call to discuss your specific challenges and get tailored advice.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${mentor.hourlyRate || 100}</span>
                            <Button
                              variant="outline"
                              className="border-cyan-500 text-cyan-500 hover:bg-cyan-950"
                              onClick={() => setShowBookingDialog(true)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-purple-950/50 flex items-center justify-center">
                              <MessageSquare className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-bold">Text Consultation</h3>
                              <p className="text-sm text-gray-400">1 week</p>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Asynchronous text-based mentorship for ongoing support and feedback.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${(mentor.hourlyRate || 100) * 3}</span>
                            <Button
                              variant="outline"
                              className="border-purple-500 text-purple-500 hover:bg-purple-950"
                              onClick={() => setShowBookingDialog(true)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-blue-950/50 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-bold">Group Session</h3>
                              <p className="text-sm text-gray-400">90 minutes</p>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Join a small group of peers for a collaborative learning experience.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${(mentor.hourlyRate || 100) * 0.6}</span>
                            <Button
                              variant="outline"
                              className="border-blue-500 text-blue-500 hover:bg-blue-950"
                              onClick={() => setShowBookingDialog(true)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-colors duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-green-950/50 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-bold">Code Review</h3>
                              <p className="text-sm text-gray-400">45 minutes</p>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-4">
                            Get detailed feedback on your code or project from an expert perspective.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">${(mentor.hourlyRate || 100) * 0.8}</span>
                            <Button
                              variant="outline"
                              className="border-green-500 text-green-500 hover:bg-green-950"
                              onClick={() => setShowBookingDialog(true)}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Availability calendar */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-2">Availability</h2>
                      <p className="text-gray-400 mb-6">
                        Select a date to check {mentor.name}'s availability and book a session
                      </p>
                      <BookingCalendar mentor={mentor} />
                    </div>

                    {/* Past sessions */}
                    <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                      <h2 className="text-xl font-bold mb-6">Past Sessions</h2>

                      {mentor.pastSessions && mentor.pastSessions.length > 0 ? (
                        <div className="space-y-4">
                          {mentor.pastSessions.map((session: any, index: number) => (
                            <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold">{session.title}</h3>
                                  <p className="text-sm text-gray-400">
                                    {new Date(session.date).toLocaleDateString()} • {session.duration} minutes
                                  </p>
                                </div>
                                <Badge
                                  className={
                                    session.status === "completed"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-yellow-500/20 text-yellow-400"
                                  }
                                >
                                  {session.status}
                                </Badge>
                              </div>
                              <p className="text-gray-300 mb-3">{session.description}</p>
                              {session.feedback && (
                                <div className="bg-gray-900/50 rounded p-3 text-sm">
                                  <p className="font-medium mb-1">Feedback:</p>
                                  <p className="text-gray-400">{session.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 mb-4">
                            <Calendar className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                          <p className="text-gray-400 mb-6">Book your first session with {mentor.name}</p>
                          <Button
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                            onClick={() => setShowBookingDialog(true)}
                          >
                            Book a Session
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Booking dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">Book a Session with {mentor.name}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Select a session type and time that works for you
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Session Type</h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: "1on1",
                        name: "1:1 Video Session",
                        duration: "60 minutes",
                        price: mentor.hourlyRate || 100,
                        icon: <Video className="h-5 w-5 text-cyan-400" />,
                      },
                      {
                        id: "text",
                        name: "Text Consultation",
                        duration: "1 week",
                        price: (mentor.hourlyRate || 100) * 3,
                        icon: <MessageSquare className="h-5 w-5 text-purple-400" />,
                      },
                      {
                        id: "group",
                        name: "Group Session",
                        duration: "90 minutes",
                        price: (mentor.hourlyRate || 100) * 0.6,
                        icon: <Users className="h-5 w-5 text-blue-400" />,
                      },
                      {
                        id: "code",
                        name: "Code Review",
                        duration: "45 minutes",
                        price: (mentor.hourlyRate || 100) * 0.8,
                        icon: <BookOpen className="h-5 w-5 text-green-400" />,
                      },
                    ].map((type) => (
                      <div
                        key={type.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          selectedSessionType === type.id
                            ? "border-cyan-500 bg-cyan-950/30"
                            : "border-gray-800 hover:border-cyan-500/50"
                        } cursor-pointer transition-colors`}
                        onClick={() => setSelectedSessionType(type.id)}
                      >
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-gray-400">{type.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${type.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Additional Information</h3>
                    <Textarea
                      placeholder="Share what you'd like to discuss in this session..."
                      className="bg-gray-800 border-gray-700 focus:border-cyan-500 h-32"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Select Date & Time</h3>
                  <BookingCalendar 
                    mentor={mentor}
                    compact 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-800 mt-4">
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                Cancel
              </Button>
              <Button 
                className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white ${isSubmitting ? 'opacity-70' : ''}`}
                disabled={!selectedSessionType || !selectedDate || !selectedTime || isSubmitting}
                onClick={handleBookingSubmit}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-r-transparent border-white animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Leave a Review</DialogTitle>
              <DialogDescription className="text-gray-400">
                Share your experience with {mentor.name}
              </DialogDescription>
            </DialogHeader>

            <ReviewForm mentorId={mentor.userId} onSuccess={() => setShowReviewDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Fallback if no data
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 flex items-center justify-center">
      <div className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-8 max-w-md text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
        <p className="text-gray-400 mb-6">The mentor profile you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/mentors")}>Browse Mentors</Button>
      </div>
    </div>
  )
}

