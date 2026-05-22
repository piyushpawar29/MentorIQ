"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AuthModal from "@/components/auth-modal"
import { 
  Users, 
  Target, 
  Lightbulb, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Award, 
  Zap,
  ArrowRight
} from "lucide-react"

export default function AboutPage() {
  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authType, setAuthType] = useState<"login" | "signup">("signup")
  
  // Open auth modal
  const openAuthModal = (type: "login" | "signup") => {
    setAuthType(type)
    setShowAuthModal(true)
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header/Navigation would be here, but it's conditionally rendered in the layout */}
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#4338ca_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#0ea5e9_0%,transparent_70%)]"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-6"
            >
              About MentorIQ
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-300 mb-8"
            >
              Bridging the gap between aspiration and achievement through AI-powered mentorship
            </motion.p>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  MentorIQ was born from a simple observation: despite living in an interconnected world, 
                  finding the right mentor remains challenging for many students and young professionals.
                </p>
                <p>
                  Founded in 2025 by a team of education enthusiasts and tech innovators, we set out to 
                  democratize access to quality mentorship through the power of artificial intelligence.
                </p>
                <p>
                  Our platform uses advanced matching algorithms to connect mentees with mentors who not only 
                  have the right expertise but also align with their learning style, career goals, and personal values.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-xl"></div>
              <div className="relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <Image 
                  src="/images/about-story.jpg" 
                  alt="MentorIQ Story" 
                  width={600} 
                  height={400}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80";
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mission & Vision</h2>
            <p className="text-gray-300">
              We're driven by a clear purpose and a bold vision for the future of mentorship
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800 h-full hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    To democratize access to quality mentorship by leveraging AI to create meaningful connections 
                    between mentees and mentors, regardless of geographical, social, or economic barriers.
                  </p>
                  <p className="text-gray-300 mt-4">
                    We believe that everyone deserves access to guidance from those who have walked the path before them,
                    and we're committed to making that a reality.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800 h-full hover:border-cyan-500/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    To create a world where personalized mentorship is accessible to everyone, 
                    accelerating personal and professional growth across all fields and disciplines.
                  </p>
                  <p className="text-gray-300 mt-4">
                    We envision a future where AI-powered mentorship becomes an integral part of education and 
                    professional development, breaking down barriers and creating opportunities for all.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* What We Offer Section */}
      <section className="py-16 md:py-24 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What We Offer</h2>
            <p className="text-gray-300">
              Our platform provides a comprehensive mentorship experience powered by cutting-edge AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-6 w-6 text-cyan-400" />,
                title: "AI-Powered Matching",
                description: "Our advanced algorithms match mentees with the perfect mentor based on skills, goals, and learning styles."
              },
              {
                icon: <Calendar className="h-6 w-6 text-cyan-400" />,
                title: "Flexible Scheduling",
                description: "Book sessions at times that work for you with our intuitive scheduling system."
              },
              {
                icon: <MessageSquare className="h-6 w-6 text-cyan-400" />,
                title: "Secure Messaging",
                description: "Communicate seamlessly with your mentor through our encrypted messaging platform."
              },
              {
                icon: <BookOpen className="h-6 w-6 text-cyan-400" />,
                title: "Resource Sharing",
                description: "Exchange documents, links, and learning materials to enhance your mentorship experience."
              },
              {
                icon: <Award className="h-6 w-6 text-cyan-400" />,
                title: "Verified Mentors",
                description: "All mentors undergo a thorough verification process to ensure quality guidance."
              },
              {
                icon: <Zap className="h-6 w-6 text-cyan-400" />,
                title: "Progress Tracking",
                description: "Set goals and track your progress with detailed analytics and feedback."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-900/60 backdrop-blur-lg border-gray-800 h-full hover:border-cyan-500/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meet the Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
            <p className="text-gray-300">
              The passionate individuals behind MentorIQ's mission
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Piyush Pawar",
                role: "Co-Founder & CEO",
                bio: "Education technology executive with a passion for democratizing access to mentorship.",
                image: "piyush.jpeg"
              },
              {
                name: "Nikunj Maltare",
                role: "Co-Founder & CEO",
                bio: "AI researcher with expertise in matching algorithms and natural language processing.",
                image: "nikunj.png"
              },
              {
                name: "Piyush Pawar",
                role: "UX Director",
                bio: "Designer focused on creating accessible and intuitive experiences for mentors and mentees alike.",
                image: "piyush.jpeg"
              },
              {
                name: "Nikunj Maltare",
                role: "CTO & CMO",
                bio: "A tech enthusiast with a passion for building innovative solutions.",
                image: "nikunj.png"
              },
            ].map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-4 relative mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-md"></div>
                  <Avatar className="w-37 h-37 border-2 border-cyan-500 rounded-full shadow-lg hover:shadow-xl transition-shadow hover:border-cyan-300 mx-auto relative">
                    <AvatarImage 
                      src={member.image} 
                      alt={member.name} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`;
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-cyan-400 mb-3">{member.role}</p>
                <p className="text-gray-300 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-gray-900 to-gray-900/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Join the ConnectEd Community?</h2>
              <p className="text-gray-300 text-lg">
                Whether you're seeking guidance or looking to share your expertise, we have a place for you.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/mentors" passHref>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 px-8 text-lg">
                  Find a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
              className="bg-transparent border-cyan-500 border-1 text-cyan-500 hover:bg-cyan-950 py-6 px-8 text-lg"
              onClick={() => openAuthModal("signup")}
            >
              Become a Mentor
            </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            type={authType}
            onClose={() => setShowAuthModal(false)}
            onSwitchType={(type) => setAuthType(type)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
