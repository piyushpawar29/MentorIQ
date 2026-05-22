"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Video,
  Calendar,
  Menu,
  X,
  Sparkles,
  Award,
  Zap,
  BookOpen,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import AuthModal from "@/components/auth-modal"
import BackgroundScene from "@/components/background-scene"


export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authType, setAuthType] = useState<"login" | "signup">("login")

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to section with smooth behavior
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
    setMobileMenuOpen(false)
  }

  // Open auth modal
  const openAuthModal = (type: "login" | "signup") => {
    setAuthType(type)
    setShowAuthModal(true)
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white transition-colors duration-300 relative overflow-hidden`}
    >
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundScene />
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-3 bg-gray-950/90 backdrop-blur-md shadow-lg" : "py-6 bg-transparent"}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-70"></div>
              <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
                <span className="font-bold text-cyan-500">M</span>
              </div>
            </div>
            <span className="font-bold text-xl">MentorIQ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("features")
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("how-it-works")
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#cta"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection("cta")
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Get Started
            </Link>
            {/* <Link href="/dashboard/mentor" className="text-gray-300 hover:text-white transition-colors">
              Mentor Dashboard
            </Link>
            <Link href="/dashboard/mentee" className="text-gray-300 hover:text-white transition-colors">
              Mentee Dashboard
            </Link> */}
          </nav>

          <div className="flex items-center gap-4 z-50">
            <Button
              variant="outline"
              className="hidden md:flex border-cyan-500 text-cyan-500 hover:bg-cyan-950"
              onClick={() => openAuthModal("login")}
            >
              Log In
            </Button>

            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              onClick={() => openAuthModal("signup")}
            >
              Sign Up
            </Button>

            <button
              className="md:hidden p-2 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-gray-950/95 backdrop-blur-sm z-40 pt-24 px-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="flex flex-col gap-4">
                <Link
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("features")
                  }}
                  className="text-xl py-3 border-b border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("how-it-works")
                  }}
                  className="text-xl py-3 border-b border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="#cta"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection("cta")
                  }}
                  className="text-xl py-3 border-b border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard/mentor"
                  className="text-xl py-3 border-b border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  Mentor Dashboard
                </Link>
                <Link
                  href="/dashboard/mentee"
                  className="text-xl py-3 border-b border-gray-800 text-gray-300 hover:text-white transition-colors"
                >
                  Mentee Dashboard
                </Link>

                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-cyan-500 text-cyan-500 hover:bg-cyan-950"
                    onClick={() => {
                      openAuthModal("login")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                    onClick={() => {
                      openAuthModal("signup")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 to-transparent"></div>
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                  AI-Powered Mentorship Platform
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Connect with Expert Mentors
              </motion.h1>

              <motion.p
                className="text-xl text-gray-300 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                MentorIQ brings together learners and industry experts for personalized mentorship. Accelerate your
                growth with guidance from professionals who've been there.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  className="relative group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg"
                  onClick={() => openAuthModal("signup")}
                >
                  <span className="absolute inset-0 bg-white/20 rounded-md blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    Find a Mentor
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-400 hover:bg-purple-950/50 px-8 py-6 text-lg"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  How It Works
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  <span>Personalized Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-500" />
                  <span>Expert Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-cyan-500" />
                  <span>Career Growth</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="flex-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                <Image
                  src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  width={700}
                  height={700}
                  alt="AI Mentorship Illustration"
                  className="relative z-10 rounded-2xl "
                  priority
                />

                {/* Floating elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-800 z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-70"></div>
                      <div className="relative h-10 w-10 bg-gray-900 rounded-full border border-green-500 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Matching</p>
                      <p className="text-xs text-gray-400">Find your perfect mentor</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-800 z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-full blur-sm opacity-70"></div>
                      <div className="relative h-10 w-10 bg-gray-900 rounded-full border border-purple-500 flex items-center justify-center">
                        <Video className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Video Sessions</p>
                      <p className="text-xs text-gray-400">Face-to-face mentoring</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20  relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our platform offers everything you need to connect with the perfect mentor and accelerate your growth.
            </p>
          </div>

          <Tabs defaultValue="matching" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-3 mb-12 bg-gray-900/50 p-1 rounded-lg">
              <TabsTrigger
                value="matching"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <Users className="h-4 w-4 mr-2" />
                Matching
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <Video className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger
                value="booking"
                className="data-[state=active]:bg-gradient-to-r from-cyan-500/20 to-blue-500/20 data-[state=active]:text-cyan-400"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Booking
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl blur-3xl"></div>

              <TabsContent value="matching" className="relative mt-0">
                <div className="grid md:grid-cols-2 gap-8 items-center p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                      AI-Powered Matching
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Our advanced algorithm finds the perfect mentor based on your goals, skills, and preferences. We
                      analyze hundreds of data points to ensure the best possible match.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Personality compatibility analysis",
                        "Skills and expertise matching",
                        "Career path alignment",
                        "Learning style optimization",
                        "Continuous improvement with feedback",
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start"
                        >
                          <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg"></div>
                    <Image
                      src="/ai-feature.webp?height=500&width=200&text=AI+Matching"
                      width={400}
                      height={300}
                      alt="AI Matching"
                      className="relative z-10 rounded-xl w-full"
                    />
                  </div> 
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="relative mt-0">
                <div className="grid md:grid-cols-2 gap-8 items-center p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                      1:1 Video Sessions
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Connect face-to-face with your mentor through our seamless video conferencing platform. Our HD
                      video quality and reliable connection ensure productive sessions.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "HD video and crystal-clear audio",
                        "Screen sharing and collaborative tools",
                        "Session recording for later review",
                        "Automatic note-taking with AI",
                        "Integrated resource sharing",
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start"
                        >
                          <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-lg"></div>
                    <Image
                      src="/video-feature.jpg?height=300&width=400&text=Video+Sessions"
                      width={400}
                      height={300}
                      alt="Video Sessions"
                      className="relative z-10 rounded-xl w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="booking" className="relative mt-0">
                <div className="grid md:grid-cols-2 gap-8 items-center p-6 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                      Seamless Booking
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Schedule sessions with ease using our intuitive calendar integration system. Find the perfect time
                      that works for both you and your mentor.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Calendar integration with Google, Outlook, and Apple",
                        "Timezone detection and conversion",
                        "Flexible scheduling options",
                        "Automated reminders and notifications",
                        "Easy rescheduling and cancellation",
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start"
                        >
                          <div className="mr-3 mt-1 h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-green-600 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl blur-lg"></div>
                    <Image
                      src="/schedule-feature.webp?height=300&width=400&text=Booking+System"
                      width={400}
                      height={300}
                      alt="Booking System"
                      className="relative z-10 rounded-xl w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section - Redesigned */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How MentorIQ Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Getting started with MentorIQ is simple. Follow these steps to begin your mentorship journey.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Hexagon background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl blur-3xl"></div>

            <div className="relative bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left side - Steps */}
                <div className="space-y-12">
                  {[
                    {
                      number: "01",
                      title: "Create Your Profile",
                      description: "Sign up and tell us about your goals, interests, and what you're looking to learn.",
                      icon: <Users className="h-6 w-6 text-cyan-400" />,
                      color: "from-cyan-500/20 to-cyan-500/5",
                    },
                    {
                      number: "02",
                      title: "Get Matched",
                      description:
                        "Our AI algorithm matches you with mentors who have the expertise you're looking for.",
                      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
                      color: "from-purple-500/20 to-purple-500/5",
                    },
                    {
                      number: "03",
                      title: "Book a Session",
                      description: "Schedule a time that works for both you and your mentor using our booking system.",
                      icon: <Calendar className="h-6 w-6 text-blue-400" />,
                      color: "from-blue-500/20 to-blue-500/5",
                    },
                    {
                      number: "04",
                      title: "Learn & Grow",
                      description:
                        "Connect with your mentor, receive personalized guidance, and accelerate your growth.",
                      icon: <BookOpen className="h-6 w-6 text-green-400" />,
                      color: "from-green-500/20 to-green-500/5",
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`flex-shrink-0 h-14 w-14 rounded-lg bg-gradient-to-b ${step.color} flex items-center justify-center`}
                      >
                        <div className="h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">{step.number}</div>
                        <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                          {step.title}
                        </h3>
                        <p className="text-gray-300">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right side - Interactive illustration */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="relative w-full h-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur-xl"></div>
                    <div className="relative z-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-full">
                      <div className="flex flex-col h-full justify-between">
                        {/* Profile creation animation */}
                        <div className="mb-8">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-700 animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                              <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-full bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-5/6 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-4/6 bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>

                        {/* Matching animation */}
                        <div className="mb-8">
                          <div className="flex justify-between mb-4">
                            <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 self-center mx-2"></div>
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-purple-400" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-16 w-16 rounded-lg bg-gray-700 animate-pulse"></div>
                            <div className="h-16 w-16 rounded-lg bg-gray-700 animate-pulse"></div>
                            <div className="h-16 w-16 rounded-lg bg-gray-700 animate-pulse"></div>
                          </div>
                        </div>

                        {/* Calendar animation */}
                        <div className="mb-8">
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {[...Array(7)].map((_, i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400"
                              >
                                {i + 1}
                              </div>
                            ))}
                            {[...Array(7)].map((_, i) => (
                              <div
                                key={i + 7}
                                className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400"
                              >
                                {i + 8}
                              </div>
                            ))}
                            {[...Array(7)].map((_, i) => (
                              <div
                                key={i + 14}
                                className={`h-6 w-6 rounded ${i === 2 ? "bg-cyan-500 text-white" : "bg-gray-700 text-gray-400"} flex items-center justify-center text-xs`}
                              >
                                {i + 15}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-8 w-16 bg-cyan-500/30 rounded"></div>
                            <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>

                        {/* Video call animation */}
                        <div>
                          <div className="h-24 w-full bg-gray-700 rounded-lg relative overflow-hidden">
                            <div className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <Video className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                              <div className="text-xs text-green-500">Live</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-12 text-center">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
              onClick={() => openAuthModal("signup")}
            >
              Start Your Journey
            </Button>
          </div> */}
        </div>
      </section>

      {/* Mentor Spotlight Section */}
      {/* <section id="mentors" className="py-20 bg-gray-950 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
              Expert Mentors
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Top Mentors</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Learn from industry leaders who are passionate about sharing their knowledge and expertise.
            </p>
          </div>

          <MentorSpotlight />

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="border-cyan-500 text-cyan-500 hover:bg-cyan-950"
              onClick={() => scrollToSection("search")}
            >
              Browse All Mentors
            </Button>
          </div>
        </div>
      </section> 

      {/* Final CTA Section */}
      <section id="cta" className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Accelerate Your Growth?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join MentorIQ today and get matched with mentors who can help you reach your full potential.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                className="relative group bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
                onClick={() => openAuthModal("signup")}
              >
                <span className="absolute inset-0 bg-white/20 rounded-md blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
             
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-sm opacity-70"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
                    <span className="font-bold text-cyan-500 text-xs">C</span>
                  </div>
                </div>
                <span className="font-bold text-lg">MentorIQ</span>
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                Connecting learners with expert mentors through the power of AI.
              </p>
              {/* <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div> */}
            </div>

            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
                    How it Works
                  </Link>
                </li>
                {/* <li>
                  <Link href="#mentors" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Mentors
                  </Link>
                </li> */}
                {/* <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    For Businesses
                  </Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Careers
                  </Link>
                </li> */}
                {/* <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li> */}
                <li>
                  {/* <Link onClick href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
                  </Link> */}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} MentorIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>

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

