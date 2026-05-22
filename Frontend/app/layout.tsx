import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MentorIQ - Expert Mentorship Platform",
  description:
    "Connect with expert mentors through our AI-powered matching platform. Accelerate your career growth with personalized mentorship.",
  keywords: "mentorship, education, career growth, professional development, mentors, coaching",
  openGraph: {
    title: "MentorIQ - Expert Mentorship Platform",
    description:
      "Connect with expert mentors through our AI-powered matching platform. Accelerate your career growth with personalized mentorship.",
    url: "https://mentoriq.com",
    siteName: "MentorIQ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MentorIQ Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Navigation progress indicator removed */}
          {/* Navbar will be conditionally rendered inside the component */}
          <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
              {/* <div className="fixed inset-0 z-0 pointer-events-none">
                <BackgroundScene />
              </div> */}
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
