import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertVolunteerSchema,
  insertPositionSchema,
  insertApplicationSchema,
  insertMedicalScreeningSchema,
  insertPlacementSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/dashboard/urgent-items', isAuthenticated, async (req, res) => {
    try {
      const urgentItems = await storage.getUrgentItems();
      res.json(urgentItems);
    } catch (error) {
      console.error("Error fetching urgent items:", error);
      res.status(500).json({ message: "Failed to fetch urgent items" });
    }
  });

  app.get('/api/dashboard/recent-activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getActivities({ limit: 10 });
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  // Volunteer routes
  app.get('/api/volunteers', isAuthenticated, async (req, res) => {
    try {
      const { status, search, limit, offset } = req.query;
      const volunteers = await storage.getVolunteers({
        status: status as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.get('/api/volunteers/:id', isAuthenticated, async (req, res) => {
    try {
      const volunteer = await storage.getVolunteer(req.params.id);
      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      res.json(volunteer);
    } catch (error) {
      console.error("Error fetching volunteer:", error);
      res.status(500).json({ message: "Failed to fetch volunteer" });
    }
  });

  app.post('/api/volunteers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(validatedData);
      res.status(201).json(volunteer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating volunteer:", error);
      res.status(500).json({ message: "Failed to create volunteer" });
    }
  });

  app.patch('/api/volunteers/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertVolunteerSchema.partial().parse(req.body);
      const volunteer = await storage.updateVolunteer(req.params.id, validatedData);
      res.json(volunteer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating volunteer:", error);
      res.status(500).json({ message: "Failed to update volunteer" });
    }
  });

  app.delete('/api/volunteers/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteVolunteer(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Volunteer not found" });
      }
      res.json({ message: "Volunteer deleted successfully" });
    } catch (error) {
      console.error("Error deleting volunteer:", error);
      res.status(500).json({ message: "Failed to delete volunteer" });
    }
  });

  // Position routes
  app.get('/api/positions', isAuthenticated, async (req, res) => {
    try {
      const { sector, country, isOpen, search, limit, offset } = req.query;
      const positions = await storage.getPositions({
        sector: sector as string,
        country: country as string,
        isOpen: isOpen ? isOpen === 'true' : undefined,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  app.get('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const position = await storage.getPosition(req.params.id);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      res.json(position);
    } catch (error) {
      console.error("Error fetching position:", error);
      res.status(500).json({ message: "Failed to fetch position" });
    }
  });

  app.post('/api/positions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPositionSchema.parse(req.body);
      
      // Set end date to 27 months from start date if not provided
      if (validatedData.startDate && !validatedData.endDate) {
        const endDate = new Date(validatedData.startDate);
        endDate.setMonth(endDate.getMonth() + 27);
        validatedData.endDate = endDate.toISOString().split('T')[0];
      }
      
      const position = await storage.createPosition(validatedData);
      res.status(201).json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating position:", error);
      res.status(500).json({ message: "Failed to create position" });
    }
  });

  app.patch('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPositionSchema.partial().parse(req.body);
      const position = await storage.updatePosition(req.params.id, validatedData);
      res.json(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating position:", error);
      res.status(500).json({ message: "Failed to update position" });
    }
  });

  app.delete('/api/positions/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deletePosition(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Position not found" });
      }
      res.json({ message: "Position deleted successfully" });
    } catch (error) {
      console.error("Error deleting position:", error);
      res.status(500).json({ message: "Failed to delete position" });
    }
  });

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, positionId, status, limit, offset } = req.query;
      const applications = await storage.getApplications({
        volunteerId: volunteerId as string,
        positionId: positionId as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(req.params.id, validatedData);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Medical screening routes
  app.get('/api/medical-screenings', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, status } = req.query;
      const screenings = await storage.getMedicalScreenings({
        volunteerId: volunteerId as string,
        status: status as string,
      });
      res.json(screenings);
    } catch (error) {
      console.error("Error fetching medical screenings:", error);
      res.status(500).json({ message: "Failed to fetch medical screenings" });
    }
  });

  app.get('/api/medical-screenings/:id', isAuthenticated, async (req, res) => {
    try {
      const screening = await storage.getMedicalScreening(req.params.id);
      if (!screening) {
        return res.status(404).json({ message: "Medical screening not found" });
      }
      res.json(screening);
    } catch (error) {
      console.error("Error fetching medical screening:", error);
      res.status(500).json({ message: "Failed to fetch medical screening" });
    }
  });

  app.post('/api/medical-screenings', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalScreeningSchema.parse(req.body);
      const screening = await storage.createMedicalScreening(validatedData);
      res.status(201).json(screening);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating medical screening:", error);
      res.status(500).json({ message: "Failed to create medical screening" });
    }
  });

  app.patch('/api/medical-screenings/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalScreeningSchema.partial().parse(req.body);
      const screening = await storage.updateMedicalScreening(req.params.id, validatedData);
      res.json(screening);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating medical screening:", error);
      res.status(500).json({ message: "Failed to update medical screening" });
    }
  });

  // Placement routes
  app.get('/api/placements', isAuthenticated, async (req, res) => {
    try {
      const { volunteerId, positionId, status } = req.query;
      const placements = await storage.getPlacements({
        volunteerId: volunteerId as string,
        positionId: positionId as string,
        status: status as string,
      });
      res.json(placements);
    } catch (error) {
      console.error("Error fetching placements:", error);
      res.status(500).json({ message: "Failed to fetch placements" });
    }
  });

  app.post('/api/placements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPlacementSchema.parse(req.body);
      const placement = await storage.createPlacement(validatedData);
      res.status(201).json(placement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating placement:", error);
      res.status(500).json({ message: "Failed to create placement" });
    }
  });

  app.patch('/api/placements/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPlacementSchema.partial().parse(req.body);
      const placement = await storage.updatePlacement(req.params.id, validatedData);
      res.json(placement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating placement:", error);
      res.status(500).json({ message: "Failed to update placement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
