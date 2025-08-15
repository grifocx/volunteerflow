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

    // Simulate authentication by setting session data
    (req as any).user = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image_url: user.profileImageUrl
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    // Mark as authenticated
    (req as any).isAuthenticated = () => true;

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
    (req as any).user = null;
    (req as any).isAuthenticated = () => false;
    res.json({ message: "Logged out successfully" });
  });
}

// Development authentication middleware - checks session or allows dev users
export const isAuthenticatedDev: RequestHandler = async (req, res, next) => {
  // Check if this is a development user session
  const user = (req as any).user;
  
  if (user && user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }
  }

  // If not authenticated, return 401
  return res.status(401).json({ message: "Unauthorized" });
};