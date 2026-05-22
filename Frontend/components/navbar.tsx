"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Calendar, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import LogoutButton from "@/components/logout-button"

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const storedUserRole = localStorage.getItem('userRole')
      setIsLoggedIn(!!token)
      setUserRole(storedUserRole)
    }
  }, [pathname])

  // Don't show navbar on the homepage or authentication pages
  if (!pathname || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              MentorIQ
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`flex items-center space-x-1 text-sm ${pathname && pathname === '/' ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/mentors" 
              className={`flex items-center space-x-1 text-sm ${pathname && pathname.startsWith('/mentors') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
            >
              <Users className="h-4 w-4" />
              <span>Mentors</span>
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  href={userRole === 'mentor' ? '/dashboard/mentor' : '/dashboard/mentee'} 
                  className={`flex items-center space-x-1 text-sm ${pathname && pathname.includes('/dashboard') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/sessions" 
                  className={`flex items-center space-x-1 text-sm ${pathname && pathname.includes('/sessions') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Sessions</span>
                </Link>
                <Link 
                  href="/messages" 
                  className={`flex items-center space-x-1 text-sm ${pathname && pathname.includes('/messages') ? 'text-cyan-400' : 'text-gray-300 hover:text-white'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <LogoutButton variant="ghost" size="sm" />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
