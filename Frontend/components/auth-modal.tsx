"use client"
import { Badge } from "@/components/ui/badge"
import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { X, Mail, Lock, User, ChromeIcon as Google, Briefcase, GraduationCap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import GradientSpinner from "@/components/ui/gradient-spinner"


interface AuthModalProps {
  type: "login" | "signup";
  onClose: () => void;
  onSwitchType: (type: "login" | "signup") => void;
}

export default function AuthModal({ type, onClose, onSwitchType }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<"mentee" | "mentor" | "">("")
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  // Mentor profile fields
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [communicationPreference, setCommunicationPreference] = useState<string>("")
  const [categoryValue, setCategoryValue] = useState("Technology")

  // Mentee profile fields
  const [interests, setInterests] = useState<string[]>([])
  const [goals, setGoals] = useState("")
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])

  const router = useRouter()

 // const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordError, setPasswordError] = useState("")

  // State for success message display
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Function to reset all form fields
  const resetFormFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setPasswordError("");
    setUserRole("");
    setShowRoleSelection(false);
    setShowProfileForm(false);
    
    // Reset mentor fields
    setBio("");
    setSkills([]);
    setExperience("");
    setLanguages([]);
    setCommunicationPreference("");
    setCategoryValue("Technology");
    
    // Reset mentee fields
    setInterests([]);
    setGoals("");
    setPreferredLanguages([]);
  };
  
  // Function to handle registration success
  const handleRegistrationSuccess = (data: any) => {
    if (data.token) {
      // Clear loading and errors
      setLoading(false);
      setError("");
      
      // Show success message briefly, then switch to login tab
      setSuccessMessage("Registration successful! Please log in with your new credentials.");
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        resetFormFields();
        onSwitchType("login");
      }, 1500);
    } else {
      throw new Error("No token received");
    }
  };
  const handleBack = () => {
  if (showRoleSelection) {
    setShowRoleSelection(false);
  } else if (showProfileForm) {
    setShowProfileForm(false);
  }
  };
   
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    return passwordRegex.test(password);
  };

  // Direct form submission functions to avoid recursive issues
  const submitMentorForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Submitting mentor form directly");
    
    if (loading) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Extract company name from experience text if available
      const companyMatch = experience.match(/at\s+([^,\.]+)/i);
      const company = companyMatch ? companyMatch[1].trim() : 'Independent';
      
      const userData = {
        name,
        email,
        password,
        role: "mentor",
        bio, 
        skills,
        experience,
        languages,
        communicationPreference,
        company,
        hourlyRate: 50,
        category: categoryValue,
        expertise: skills
      };
      
      console.log("Sending mentor registration data:", userData);
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });
      
      const responseText = await res.text();
      console.log("Registration response status:", res.status, "text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }
        
        // Success! Handle registration success
        if (data.token) {
          handleRegistrationSuccess(data);
        } else {
          throw new Error("No token received");
        }
      } catch (err: any) {
        console.error("Error parsing response:", err);
        setError(err.message || "Failed to process response");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  
  const submitMenteeForm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Submitting mentee form directly");
    
    if (loading) return;
    
    setLoading(true);
    setError("");
    
    try {
      const userData = {
        name,
        email,
        password,
        role: "mentee",
        interests,
        goals,
        preferredLanguages: ["English"],
        educationLevel: 'Other',
        preferredCommunication: 'Any'
      };
      
      console.log("Sending mentee registration data:", userData);
      
      const backendUrl2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const res = await fetch(`${backendUrl2}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });
      
      const responseText = await res.text();
      console.log("Registration response status:", res.status, "text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }
        
        // Success! Handle registration success
        if (data.token) {
          handleRegistrationSuccess(data);
        } else {
          throw new Error("No token received");
        }
      } catch (err: any) {
        console.error("Error parsing response:", err);
        setError(err.message || "Failed to process response");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Form submitted - current state:", { type, showRoleSelection, showProfileForm, userRole });

  // Prevent multiple submissions
  if (loading) {
    console.log("Submission already in progress, ignoring request");
    return;
  }

  // First screen - basic info
  if (type === "signup" && !showRoleSelection) {
    // const password = passwordRef.current.value;
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    setShowRoleSelection(true);
    return;
  }

    // Second screen - role selection
    if (type === "signup" && showRoleSelection && !showProfileForm && userRole) {
      setShowProfileForm(true)
      return
    }

    // IMPORTANT: Only reach here when actually submitting the final form data
    console.log("Proceeding with final form submission");
    setLoading(true)
    setError("")
    

    try {
      if (type === "login") {
        try {
          console.log("Attempting login with:", { email, password })
          const loginUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          const res = await fetch(`${loginUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          const data = await res.json()
          console.log("Login response:", data)

          if (!res.ok) {
            throw new Error(data.message || "Invalid email or password")
          }

          // Store token and user info in localStorage
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
          }

          onClose()
          
          // Redirect based on user role
          if (data.user.role === 'mentor') {
            router.push('/dashboard/mentor')
          } else {
            router.push('/dashboard/mentee')
          }
        } catch (error: any) {
          console.error("Login error:", error)
          setError(error.message || "Invalid email or password")
        }
      } else {
        // Signup form submission - final screen with profile info
        console.log("Processing registration - current state:", { 
          userRole, 
          mentor: { bio, skills, experience, languages, communicationPreference },
          mentee: { interests, goals, preferredLanguages }
        })
        
        // Validate required fields first
        if (userRole === "mentor") {
          if (!bio) {
            setError("Please provide your professional bio");
            setLoading(false);
            return;
          }
          if (skills.length === 0) {
            setError("Please select at least one skill");
            setLoading(false);
            return;
          }
          if (!experience) {
            setError("Please provide your experience details");
            setLoading(false);
            return;
          }
          if (languages.length === 0) {
            setError("Please select at least one language");
            setLoading(false);
            return;
          }
          if (!communicationPreference) {
            setError("Please select your preferred communication method");
            setLoading(false);
            return;
          }
        } else if (userRole === "mentee") {
          if (interests.length === 0) {
            setError("Please select at least one subject");
            setLoading(false);
            return;
          }
          if (!goals) {
            setError("Please describe your learning goals");
            setLoading(false);
            return;
          }
        }

        // Extract company name from experience text if available
        const companyMatch = experience.match(/at\s+([^,\.]+)/i);
        const company = companyMatch ? companyMatch[1].trim() : 'Independent';

        // Create appropriate data structure based on role
        let userData;
        if (userRole === "mentor") {
          userData = {
            name,
            email,
            password,
            role: userRole,
            bio, 
            skills,
            experience,
            languages,
            communicationPreference,
            company,
            hourlyRate: 50,
            category: categoryValue,
            expertise: skills
          };
        } else {
          userData = {
            name,
            email,
            password,
            role: userRole,
            interests,
            goals,
            preferredLanguages: ["English"],
            educationLevel: 'Other',
            preferredCommunication: 'Any'
          };
        }

        console.log("Attempting registration with:", userData)
        
        try {
          // Show the user what's happening
          setLoading(true);
          setError("");
          
          const registerUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          console.log("Sending registration request to:", `${registerUrl}/api/auth/register`);
          const res = await fetch(`${registerUrl}/api/auth/register`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(userData),
          }).catch(err => {
            console.error("Network error during fetch:", err);
            throw new Error("Network error: Please check your connection and try again");
          });

          console.log("Registration response status:", res.status);
          let responseText;
          try {
            responseText = await res.text();
            console.log("Raw response text:", responseText);
            
            // Try to parse the response as JSON
            let data;
            try {
              data = JSON.parse(responseText);
              console.log("Registration response data:", data);
            } catch (parseErr) {
              console.error("Failed to parse response as JSON:", parseErr);
              throw new Error("The server returned an invalid response. Please try again later.");
            }

            if (!res.ok) {
              // Extract validation error message if available
              if (data.message && data.message.includes("validation failed")) {
                const errorField = data.message.split("validation failed:")[1]?.trim() || "";
                throw new Error(`Validation error: ${errorField}. Please check your form.`);
              } else {
                throw new Error(data.message || "Failed to register user")
              }
            }

            // Handle registration success
            if (data.token) {
              console.log("Token stored in localStorage, preparing to redirect user");
              handleRegistrationSuccess(data);
            } else {
              setError("Registration successful but no token received. Please try logging in.");
              setLoading(false);
            }
          } catch (parseError: any) {
            console.error("Error processing response:", parseError);
            setError(`Error processing server response: ${parseError.message}`);
            setLoading(false);
          }
        } catch (error: any) {
          console.error("Registration error:", error)
          // Check for network errors which could indicate CORS issues
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            setError("Network error: Unable to connect to the server. This could be due to CORS issues or the server is down.")
          } else {
            setError(error.message || "An unexpected error occurred")
          }
          setLoading(false);
        }
      } 
    } catch (error: any) {
      console.error("Form submission error:", error)
      setError(error.message || "An unexpected error occurred")
      setLoading(false);
    } finally {
      // Note: We're not setting loading to false here because we want to keep
      // the loading state active until we either redirect or handle an error above
    }
  }

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-center">I want to join as a:</h3>

      <RadioGroup value={userRole} onValueChange={(value) => setUserRole(value as "mentee" | "mentor")}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`flex flex-col items-center p-4 rounded-lg border ${userRole === "mentee" ? "border-cyan-500 bg-cyan-950/20" : "border-gray-700"} cursor-pointer transition-all duration-200`}
            onClick={() => setUserRole("mentee")}
          >
            <GraduationCap className="h-10 w-10 mb-3 text-cyan-500" />
            <RadioGroupItem value="mentee" id="mentee" className="sr-only" />
            <Label htmlFor="mentee" className="text-lg font-medium cursor-pointer">
              Mentee
            </Label>
            <p className="text-sm text-gray-400 text-center mt-2">
              I'm looking for guidance and want to learn from experts
            </p>
          </div>

          <div
            className={`flex flex-col items-center p-4 rounded-lg border ${userRole === "mentor" ? "border-purple-500 bg-purple-950/20" : "border-gray-700"} cursor-pointer transition-all duration-200`}
            onClick={() => setUserRole("mentor")}
          >
            <Briefcase className="h-10 w-10 mb-3 text-purple-500" />
            <RadioGroupItem value="mentor" id="mentor" className="sr-only" />
            <Label htmlFor="mentor" className="text-lg font-medium cursor-pointer">
              Mentor
            </Label>
            <p className="text-sm text-gray-400 text-center mt-2">I want to share my knowledge and guide others</p>
          </div>
        </div>
      </RadioGroup>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={!userRole}
      >
        Continue
      </Button>
    </div>
  )

  const renderMentorProfileForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio">Professional Bio</Label>
        <Textarea
          id="bio"
          placeholder="Share your professional background and expertise..."
          className="bg-gray-800 border-gray-700"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Areas of Expertise</Label>
        <Select onValueChange={(value) => setSkills((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select your skills" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {skill}
              <button className="ml-1" onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input
          id="experience"
          type="text"
          placeholder="e.g., Senior Developer at Google"
          className="bg-gray-800 border-gray-700"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          required
        />
        <p className="text-xs text-gray-400">Please include your role and company if applicable</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="languages">Languages</Label>
        <Select onValueChange={(value) => setLanguages((prev) => [...prev, value])}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="mandarin">Mandarin</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {languages.map((language, index) => (
            <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
              {language}
              <button className="ml-1" onClick={() => setLanguages(languages.filter((_, i) => i !== index))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="communication">Preferred Communication Method</Label>
        <Select onValueChange={setCommunicationPreference}>
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue placeholder="Select communication method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Video Call">Video Call</SelectItem>
            <SelectItem value="Audio Call">Audio Call</SelectItem>
            <SelectItem value="Chat">Chat</SelectItem>
            <SelectItem value="Any">Any</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={(e) => {
          e.preventDefault();
          console.log("Mentor profile form button clicked");
          // Verify fields are filled
          if (!bio) {
            setError("Please provide your professional bio");
            return;
          }
          if (skills.length === 0) {
            setError("Please select at least one skill");
            return;
          }
          if (!experience) {
            setError("Please provide your experience details");
            return;
          }
          if (languages.length === 0) {
            setError("Please select at least one language");
            return;
          }
          if (!communicationPreference) {
            setError("Please select your preferred communication method");
            return;
          }
          if (!categoryValue) {
            setError("Please select a primary category");
            return;
          }
          
          // All checks passed, proceed with direct form submission
          // Instead of calling handleSubmit, perform the submission directly
          submitMentorForm(e);
        }}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        disabled={
          loading || !bio || skills.length === 0 || !experience || languages.length === 0 || !communicationPreference || !categoryValue
        }
      >
        {loading ? (
          <>
            <GradientSpinner size={18} className="mr-2" />
            Creating account...
          </>
        ) : (
          "Complete Registration"
        )}
      </Button>
    </div>
  )

  const renderMenteeProfileForm = () => {
    const subjectGroups = [
      {
        label: "1st Year (1st & 2nd Sem)",
        subjects: [
          "Engineering Mathematics",
          "Physics",
          "Chemistry",
          "Basic Electrical/Electronics Engineering",
          "Programming for Problem Solving (C language)",
          "Engineering Graphics",
        ],
      },
      {
        label: "2nd Year (3rd & 4th Sem)",
        subjects: [
          "Data Structures",
          "Object-Oriented Programming (Java/C++)",
          "Discrete Structures",
          "Operating Systems",
          "Digital Systems",
          "Database Management Systems",
          "Computer Networks",
        ],
      },
      {
        label: "3rd Year (5th & 6th Sem)",
        subjects: [
          "Algorithms",
          "Software Engineering",
          "Theory of Computation",
          "Compiler Design",
          "Artificial Intelligence",
          "Cloud Computing",
          "Machine Learning",
          "Cyber Security",
        ],
      },
    ]

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subjects">Subjects You Need Help With</Label>
          {subjectGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="text-xs text-gray-400 font-medium pt-1">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.subjects.map((subject) => {
                  const selected = interests.includes(subject)
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() =>
                        setInterests((prev) =>
                          selected ? prev.filter((s) => s !== subject) : [...prev, subject]
                        )
                      }
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        selected
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {subject}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((subject, index) => (
                <Badge key={index} variant="outline" className="bg-gray-800 border-gray-700">
                  {subject}
                  <button
                    className="ml-1"
                    onClick={() => setInterests(interests.filter((_, i) => i !== index))}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals">Learning Goals</Label>
          <Textarea
            id="goals"
            placeholder="What do you hope to achieve through mentorship?"
            className="bg-gray-800 border-gray-700"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            required
          />
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            if (interests.length === 0) {
              setError("Please select at least one subject");
              return;
            }
            if (!goals) {
              setError("Please describe your learning goals");
              return;
            }
            submitMenteeForm(e);
          }}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          disabled={loading || interests.length === 0 || !goals}
        >
          {loading ? (
            <>
              <GradientSpinner size={18} className="mr-2" />
              Creating account...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-70"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-gray-900 rounded-full border border-cyan-500 z-10">
              <span className="font-bold text-cyan-500 text-lg">M</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{type === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="text-gray-400 mt-1">
            {type === "login" ? "Sign in to your account" : "Join thousands of learners and mentors"}
          </p>
          </div>

        <Tabs defaultValue={type} onValueChange={(value) => onSwitchType(value as "login" | "signup")}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {showSuccessMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-3 mb-4 text-sm">
                  {successMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 bg-gray-800 border-gray-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400">
                      Forgot password?
                    </a>
                  </div> */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-gray-800 border-gray-700"
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value
                        setPassword(value)
                        // const result = zxcvbn(value)
                        // setPasswordStrength(result.score)
                        setPasswordError("")
                      }}
                      required
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <GradientSpinner size={18} className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>

           
          </TabsContent>
          <TabsContent value={type}>
            {type === "signup" && (
              <div>
                {<form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {showSuccessMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-3 mb-4 text-sm">
                  {successMessage}
                </div>
              )}

              {!showRoleSelection && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-800 border-gray-700"
                        value={password}
                        onChange={(e) => {
                          const value = e.target.value
                          setPassword(value)
                          // const result = zxcvbn(value)
                          // setPasswordStrength(result.score)
                          setPasswordError("")
                        }}
                        required
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter,one symbol and one number.
                    </div>
                    <div className="mt-1">
                      {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <GradientSpinner size={18} className="mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              )}

              {showRoleSelection && !showProfileForm && renderRoleSelection()}

              {showRoleSelection && showProfileForm && userRole === "mentee" && (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                      {error}
                    </div>
                  )}
                  {renderMenteeProfileForm()}
                </div>
              )}

              {showRoleSelection && showProfileForm && userRole === "mentor" && (
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 mb-4 text-sm">
                      {error}
                    </div>
                  )}
                  {renderMentorProfileForm()}
                </div>
              )}
            </form>}
                {(showRoleSelection || showProfileForm) && (
                  <Button onClick={handleBack} className="bg-transparent text-gray-200 mt-3 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600">
                    <ArrowLeft className="h-4 w-4 text-gray-200 hover:text-black" />
                    Back
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}