import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Development users for testing different roles
const DEV_USERS = [
  {
    id: "user_1",
    email: "recruiter@volunteerflow.org",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "recruiter",
    profileImageUrl: null
  },
  {
    id: "user_2", 
    email: "placement@volunteerflow.org",
    firstName: "Michael",
    lastName: "Chen",
    role: "placement_officer",
    profileImageUrl: null
  },
  {
    id: "user_3",
    email: "medical@volunteerflow.org", 
    firstName: "Dr. Emily",
    lastName: "Rodriguez",
    role: "medical_screener",
    profileImageUrl: null
  },
  {
    id: "user_4",
    email: "country@volunteerflow.org",
    firstName: "James", 
    lastName: "Okoye",
    role: "country_officer",
    profileImageUrl: null
  }
];

export function setupDevAuth(app: Express) {
  // Development login endpoint
  app.post('/api/dev/login', async (req, res) => {
    const { userId } = req.body;
    
    const user = DEV_USERS.find(u => u.id === userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Store user data in session
    (req.session as any).devUser = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    res.json({ 
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  });

  // Get available dev users
  app.get('/api/dev/users', (req, res) => {
    res.json(DEV_USERS.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    })));
  });

  // Development logout
  app.post('/api/dev/logout', (req, res) => {
    delete (req.session as any).devUser;
    res.json({ message: "Logged out successfully" });
  });
}

// Development authentication middleware - checks session or allows dev users
export const isAuthenticatedDev: RequestHandler = async (req, res, next) => {
  // Check if this is a development user session
  const devUser = (req.session as any).devUser;
  
  if (devUser && devUser.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now <= devUser.expires_at) {
      // Set user object for downstream middleware
      (req as any).user = devUser;
      return next();
    }
  }

  // If not authenticated, return 401
  return res.status(401).json({ message: "Unauthorized" });
};