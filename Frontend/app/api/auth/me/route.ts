import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { RequestCookies } from "next/dist/server/web/spec-extension/cookies";

export async function GET(request: Request) {
  try {
    // Get the auth token from the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Fall back to cookie if no auth header
    // Use cookies() synchronously in Next.js API routes
    const cookieStore = cookies();
    const tokenCookie = (await cookieStore).get("token");
    const cookieToken = tokenCookie ? tokenCookie.value : null;
    
    // Use either token source
    const authToken = token || cookieToken;

    if (!authToken) {
      console.error("No authentication token found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Call the backend API to get the user profile
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const response = await axios.get(`${backendUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });

    // Return the user profile
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // Return an error response instead of mock data
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile. Please try again." },
      { status: 500 }
    );
  }
} 