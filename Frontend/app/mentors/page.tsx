import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Search, Filter, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Browse Mentors | MentorAI Platform",
  description: "Find the perfect mentor to help you achieve your career goals.",
  metadataBase: new URL('http://localhost:3000')
}

export default async function MentorsPage() {
  // Use BACKEND_URL (server-side) for SSR fetches, falling back to NEXT_PUBLIC_API_URL
  const apiBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const apiUrl = new URL('/api/mentors', apiBaseUrl);
  
  // Add proper error handling for the fetch call
  let mentors = { mentors: [] };
  let error = null;
  
  try {
    // Use a timeout but avoid 'no-store' which causes build issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(apiUrl.toString(), { 
      signal: controller.signal,
      next: { revalidate: 60 } 
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Error fetching mentors: ${response.status} ${response.statusText}`);
      error = `Failed to load mentors (${response.status})`;
    } else {
      mentors = await response.json();
    }
  } catch (err) {
    console.error("Failed to fetch mentors:", err);
    error = "Failed to connect to the mentors service";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-4 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Find Your Perfect Mentor</h1>
          <p className="text-gray-400 text-center mb-8">
            Browse our curated list of expert mentors ready to help you achieve your goals
          </p>

          <div className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, skill, or expertise..."
                className="pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
              />
            </div>
            <Button variant="outline" className="border-gray-700 hover:border-cyan-500 hover:bg-gray-800">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Badge className="bg-gray-800 hover:bg-gray-700">All Categories</Badge>
            <Badge className="bg-gray-800 hover:bg-gray-700">Technology</Badge>
            <Badge className="bg-gray-800 hover:bg-gray-700">Business</Badge>
            <Badge className="bg-gray-800 hover:bg-gray-700">Design</Badge>
            <Badge className="bg-gray-800 hover:bg-gray-700">Marketing</Badge>
            <Badge className="bg-gray-800 hover:bg-gray-700">Career</Badge>
          </div>
        </div>

        {error ? (
          <div className="md:col-span-3 p-8 text-center bg-gray-900/60 backdrop-blur-lg border border-red-500/30 rounded-xl">
            <h3 className="text-xl font-medium mb-2 text-red-400">Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-gray-500">Please try again later or contact support if the problem persists.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors?.mentors?.length > 0 ? (
              mentors.mentors.map((mentor: any) => (
                <Link
                  key={mentor.id}
                  href={`/mentors/${mentor.id}`}
                  className="bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-md opacity-70"></div>
                      {/* <img
                        src={mentor.image || "/placeholder.svg?height=80&width=80"}
                        alt={mentor.name}
                        className="h-16 w-16 rounded-full border-2 border-gray-800 object-cover relative z-10"
                      /> */}
                      <div
                        className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-gray-900 ${mentor.isAvailable ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">{mentor.name}</h3>
                      <p className="text-gray-400">
                        {mentor.role} at {mentor.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise?.slice(0, 3).map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-gray-800/50 border-gray-700 text-gray-300">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise?.length > 3 && (
                      <Badge variant="outline" className="border-gray-700">
                        +{mentor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-gray-400 text-sm">({mentor.reviews?.length || 0})</span>
                    </div>
                    <div className="flex items-center text-cyan-400 group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">View Profile</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="md:col-span-3 p-8 text-center bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl">
                <h3 className="text-xl font-medium mb-2">No mentors found</h3>
                <p className="text-gray-400">Please check back later or try different filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

