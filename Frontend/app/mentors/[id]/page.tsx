import type { Metadata } from "next"
import MentorProfilePage from "@/components/mentor-profile/mentor-profile-page"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch mentor data
  const mentorId = params.id
  
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/api/mentors/${mentorId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mentor metadata: ${response.status}`)
    }
    
    const responseData = await response.json()
    
    // Check for success and extract mentor from the nested data structure
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch mentor data')
    }
    
    // The backend returns { success: true, data: { mentor, reviews } }
    const { mentor } = responseData.data
    
    const mentorName = mentor.user?.name || 'Mentor'
    const mentorBio = mentor.user?.bio || 'Connect with expert mentors through our AI-powered matching platform.'
    const mentorImage = mentor.user?.avatar || '/placeholder.svg?height=400&width=300'
    
    return {
      title: `${mentorName} | MentorIQ Platform`,
      description: mentorBio,
      openGraph: {
        images: [mentorImage],
      },
    }
  } catch (error) {
    console.error('Error fetching mentor metadata:', error)
    
    // Fallback metadata
    return {
      title: 'Mentor Profile | MentorIQ Platform',
      description: 'Connect with expert mentors through our AI-powered matching platform.',
      openGraph: {
        images: ['/placeholder.svg?height=400&width=300'],
      },
    }
  }
}

export default function MentorProfile({ params }: Props) {
  const mentorId = params.id

  return <MentorProfilePage mentorId={mentorId} />
}

