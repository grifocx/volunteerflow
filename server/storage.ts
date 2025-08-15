import {
  users,
  volunteers,
  positions,
  applications,
  medicalScreenings,
  medicalScreeningDetails,
  placements,
  activities,
  type User,
  type UpsertUser,
  type Volunteer,
  type Position,
  type Application,
  type MedicalScreening,
  type MedicalScreeningDetails,
  type Placement,
  type Activity,
  type InsertVolunteer,
  type InsertPosition,
  type InsertApplication,
  type InsertMedicalScreening,
  type InsertMedicalScreeningDetails,
  type InsertPlacement,
  type InsertActivity,
  type VolunteerWithRelations,
  type PositionWithRelations,
  type ApplicationWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, or, ilike, gte, lte, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Volunteer operations
  getVolunteers(filters?: {
    status?: string;
    sector?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<VolunteerWithRelations[]>;
  getVolunteer(id: string): Promise<VolunteerWithRelations | undefined>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  updateVolunteer(id: string, volunteer: Partial<InsertVolunteer>): Promise<Volunteer>;
  deleteVolunteer(id: string): Promise<boolean>;
  
  // Position operations
  getPositions(filters?: {
    sector?: string;
    country?: string;
    isOpen?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PositionWithRelations[]>;
  getPosition(id: string): Promise<PositionWithRelations | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, position: Partial<InsertPosition>): Promise<Position>;
  deletePosition(id: string): Promise<boolean>;
  
  // Application operations
  getApplications(filters?: {
    volunteerId?: string;
    positionId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApplicationWithRelations[]>;
  getApplication(id: string): Promise<ApplicationWithRelations | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: string): Promise<boolean>;
  
  // Medical screening operations
  getMedicalScreenings(filters?: {
    volunteerId?: string;
    status?: string;
    expiringBefore?: Date;
  }): Promise<MedicalScreening[]>;
  getMedicalScreening(id: string): Promise<MedicalScreening | undefined>;
  createMedicalScreening(screening: InsertMedicalScreening): Promise<MedicalScreening>;
  updateMedicalScreening(id: string, screening: Partial<InsertMedicalScreening>): Promise<MedicalScreening>;

  // Medical screening details operations (restricted access)
  getMedicalScreeningDetails(medicalScreeningId: string): Promise<MedicalScreeningDetails | undefined>;
  createMedicalScreeningDetails(details: InsertMedicalScreeningDetails): Promise<MedicalScreeningDetails>;
  updateMedicalScreeningDetails(id: string, details: Partial<InsertMedicalScreeningDetails>): Promise<MedicalScreeningDetails>;
  
  // Placement operations
  getPlacements(filters?: {
    volunteerId?: string;
    positionId?: string;
    status?: string;
  }): Promise<Placement[]>;
  getPlacement(id: string): Promise<Placement | undefined>;
  createPlacement(placement: InsertPlacement): Promise<Placement>;
  updatePlacement(id: string, placement: Partial<InsertPlacement>): Promise<Placement>;
  
  // Activity operations
  getActivities(filters?: {
    volunteerId?: string;
    positionId?: string;
    applicationId?: string;
    limit?: number;
  }): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard analytics
  getDashboardMetrics(): Promise<{
    activeLeads: number;
    openPositions: number;
    inScreening: number;
    deployed: number;
    pipelineStages: Array<{ stage: string; count: number; percentage: number }>;
    sectorStats: Array<{ sector: string; total: number; filled: number; open: number }>;
  }>;
  
  // Urgent items
  getUrgentItems(): Promise<Array<{
    type: string;
    title: string;
    subtitle: string;
    count: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Volunteer operations
  async getVolunteers(filters: {
    status?: string;
    sector?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<VolunteerWithRelations[]> {
    const query = db
      .select()
      .from(volunteers)
      .leftJoin(applications, eq(volunteers.id, applications.volunteerId))
      .leftJoin(positions, eq(applications.positionId, positions.id))
      .leftJoin(medicalScreenings, eq(volunteers.id, medicalScreenings.volunteerId));

    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(volunteers.status, filters.status as any));
    }
    
    if (filters.search) {
      conditions.push(or(
        ilike(volunteers.firstName, `%${filters.search}%`),
        ilike(volunteers.lastName, `%${filters.search}%`),
        ilike(volunteers.email, `%${filters.search}%`)
      ));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(volunteers.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Group by volunteer and aggregate relations
    const volunteerMap = new Map();
    result.forEach((row) => {
      const volunteer = row.volunteers;
      if (!volunteerMap.has(volunteer.id)) {
        volunteerMap.set(volunteer.id, {
          ...volunteer,
          applications: [],
          medicalScreenings: [],
        });
      }
      
      if (row.applications) {
        const existing = volunteerMap.get(volunteer.id);
        if (existing && !existing.applications.find((app: any) => app.id === row.applications!.id)) {
          existing.applications.push({
            ...row.applications,
            position: row.positions,
          });
        }
      }
      
      if (row.medical_screenings) {
        const existing = volunteerMap.get(volunteer.id);
        if (existing && !existing.medicalScreenings.find((ms: any) => ms.id === row.medical_screenings!.id)) {
          existing.medicalScreenings.push(row.medical_screenings);
        }
      }
    });

    return Array.from(volunteerMap.values());
  }

  async getVolunteer(id: string): Promise<VolunteerWithRelations | undefined> {
    const [volunteer] = await this.getVolunteers({ search: id });
    return volunteer;
  }

  async createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer> {
    const [newVolunteer] = await db
      .insert(volunteers)
      .values(volunteer)
      .returning();
    
    // Create activity
    await this.createActivity({
      type: 'volunteer_created',
      description: `New volunteer ${newVolunteer.firstName} ${newVolunteer.lastName} added to system`,
      volunteerId: newVolunteer.id,
    });
    
    return newVolunteer;
  }

  async updateVolunteer(id: string, volunteer: Partial<InsertVolunteer>): Promise<Volunteer> {
    const [updated] = await db
      .update(volunteers)
      .set({ ...volunteer, updatedAt: new Date() })
      .where(eq(volunteers.id, id))
      .returning();
    
    return updated;
  }

  async deleteVolunteer(id: string): Promise<boolean> {
    const result = await db
      .delete(volunteers)
      .where(eq(volunteers.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Position operations
  async getPositions(filters: {
    sector?: string;
    country?: string;
    isOpen?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<PositionWithRelations[]> {
    const conditions = [];
    
    if (filters.sector) {
      conditions.push(eq(positions.sector, filters.sector as any));
    }
    
    if (filters.country) {
      conditions.push(eq(positions.country, filters.country));
    }
    
    if (filters.isOpen !== undefined) {
      conditions.push(eq(positions.isOpen, filters.isOpen));
    }
    
    if (filters.search) {
      conditions.push(or(
        ilike(positions.title, `%${filters.search}%`),
        ilike(positions.description, `%${filters.search}%`),
        ilike(positions.location, `%${filters.search}%`)
      ));
    }

    const query = db
      .select()
      .from(positions)
      .leftJoin(applications, eq(positions.id, applications.positionId));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(positions.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Group by position and aggregate applications
    const positionMap = new Map();
    result.forEach((row) => {
      const position = row.positions;
      if (!positionMap.has(position.id)) {
        positionMap.set(position.id, {
          ...position,
          applications: [],
        });
      }
      
      if (row.applications) {
        const existing = positionMap.get(position.id);
        if (existing && !existing.applications.find((app: any) => app.id === row.applications!.id)) {
          existing.applications.push(row.applications);
        }
      }
    });

    return Array.from(positionMap.values());
  }

  async getPosition(id: string): Promise<PositionWithRelations | undefined> {
    const [position] = await this.getPositions({ search: id });
    return position;
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const [newPosition] = await db
      .insert(positions)
      .values(position)
      .returning();
    
    await this.createActivity({
      type: 'position_created',
      description: `New position "${newPosition.title}" created in ${newPosition.country}`,
      positionId: newPosition.id,
    });
    
    return newPosition;
  }

  async updatePosition(id: string, position: Partial<InsertPosition>): Promise<Position> {
    const [updated] = await db
      .update(positions)
      .set({ ...position, updatedAt: new Date() })
      .where(eq(positions.id, id))
      .returning();
    
    return updated;
  }

  async deletePosition(id: string): Promise<boolean> {
    const result = await db
      .delete(positions)
      .where(eq(positions.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Application operations
  async getApplications(filters: {
    volunteerId?: string;
    positionId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApplicationWithRelations[]> {
    const query = db
      .select()
      .from(applications)
      .leftJoin(volunteers, eq(applications.volunteerId, volunteers.id))
      .leftJoin(positions, eq(applications.positionId, positions.id));

    const conditions = [];
    
    if (filters.volunteerId) {
      conditions.push(eq(applications.volunteerId, filters.volunteerId));
    }
    
    if (filters.positionId) {
      conditions.push(eq(applications.positionId, filters.positionId));
    }
    
    if (filters.status) {
      conditions.push(eq(applications.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(applications.appliedAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return result.map(row => ({
      ...row.applications!,
      volunteer: row.volunteers || undefined,
      position: row.positions || undefined,
    }));
  }

  async getApplication(id: string): Promise<ApplicationWithRelations | undefined> {
    const [application] = await this.getApplications({ limit: 1 });
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    
    await this.createActivity({
      type: 'application_submitted',
      description: `Application submitted`,
      volunteerId: newApplication.volunteerId,
      positionId: newApplication.positionId,
      applicationId: newApplication.id,
    });
    
    return newApplication;
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updated] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    
    return updated;
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await db
      .delete(applications)
      .where(eq(applications.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  // Medical screening operations
  async getMedicalScreenings(filters: {
    volunteerId?: string;
    status?: string;
    expiringBefore?: Date;
  } = {}): Promise<MedicalScreening[]> {
    const conditions = [];
    
    if (filters.volunteerId) {
      conditions.push(eq(medicalScreenings.volunteerId, filters.volunteerId));
    }
    
    if (filters.status) {
      conditions.push(eq(medicalScreenings.status, filters.status as any));
    }
    
    if (filters.expiringBefore) {
      conditions.push(lte(medicalScreenings.expiresAt, filters.expiringBefore));
    }

    if (conditions.length > 0) {
      return await db.select().from(medicalScreenings)
        .where(and(...conditions))
        .orderBy(desc(medicalScreenings.createdAt));
    }

    return await db.select().from(medicalScreenings)
      .orderBy(desc(medicalScreenings.createdAt));
  }

  async getMedicalScreening(id: string): Promise<MedicalScreening | undefined> {
    const [screening] = await db
      .select()
      .from(medicalScreenings)
      .where(eq(medicalScreenings.id, id));
    
    return screening;
  }

  async createMedicalScreening(screening: InsertMedicalScreening): Promise<MedicalScreening> {
    const [newScreening] = await db
      .insert(medicalScreenings)
      .values(screening)
      .returning();
    
    return newScreening;
  }

  async updateMedicalScreening(id: string, screening: Partial<InsertMedicalScreening>): Promise<MedicalScreening> {
    const [updated] = await db
      .update(medicalScreenings)
      .set({ ...screening, updatedAt: new Date() })
      .where(eq(medicalScreenings.id, id))
      .returning();
    
    return updated;
  }

  // Medical screening details operations (restricted access)
  async getMedicalScreeningDetails(medicalScreeningId: string): Promise<MedicalScreeningDetails | undefined> {
    const [details] = await db
      .select()
      .from(medicalScreeningDetails)
      .where(eq(medicalScreeningDetails.medicalScreeningId, medicalScreeningId));
    
    return details;
  }

  async createMedicalScreeningDetails(details: InsertMedicalScreeningDetails): Promise<MedicalScreeningDetails> {
    const [newDetails] = await db
      .insert(medicalScreeningDetails)
      .values(details)
      .returning();
    
    return newDetails;
  }

  async updateMedicalScreeningDetails(id: string, details: Partial<InsertMedicalScreeningDetails>): Promise<MedicalScreeningDetails> {
    const [updated] = await db
      .update(medicalScreeningDetails)
      .set({ ...details, updatedAt: new Date() })
      .where(eq(medicalScreeningDetails.id, id))
      .returning();
    
    return updated;
  }

  // Placement operations
  async getPlacements(filters: {
    volunteerId?: string;
    positionId?: string;
    status?: string;
  } = {}): Promise<Placement[]> {
    const conditions = [];
    
    if (filters.volunteerId) {
      conditions.push(eq(placements.volunteerId, filters.volunteerId));
    }
    
    if (filters.positionId) {
      conditions.push(eq(placements.positionId, filters.positionId));
    }
    
    if (filters.status) {
      conditions.push(eq(placements.status, filters.status));
    }

    if (conditions.length > 0) {
      return await db.select().from(placements)
        .where(and(...conditions))
        .orderBy(desc(placements.createdAt));
    }

    return await db.select().from(placements)
      .orderBy(desc(placements.createdAt));
  }

  async getPlacement(id: string): Promise<Placement | undefined> {
    const [placement] = await db
      .select()
      .from(placements)
      .where(eq(placements.id, id));
    
    return placement;
  }

  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const [newPlacement] = await db
      .insert(placements)
      .values(placement)
      .returning();
    
    return newPlacement;
  }

  async updatePlacement(id: string, placement: Partial<InsertPlacement>): Promise<Placement> {
    const [updated] = await db
      .update(placements)
      .set({ ...placement, updatedAt: new Date() })
      .where(eq(placements.id, id))
      .returning();
    
    return updated;
  }

  // Activity operations
  async getActivities(filters: {
    volunteerId?: string;
    positionId?: string;
    applicationId?: string;
    limit?: number;
  } = {}): Promise<Activity[]> {
    const conditions = [];
    
    if (filters.volunteerId) {
      conditions.push(eq(activities.volunteerId, filters.volunteerId));
    }
    
    if (filters.positionId) {
      conditions.push(eq(activities.positionId, filters.positionId));
    }
    
    if (filters.applicationId) {
      conditions.push(eq(activities.applicationId, filters.applicationId));
    }

    if (conditions.length > 0) {
      return await db.select().from(activities)
        .where(and(...conditions))
        .orderBy(desc(activities.createdAt))
        .limit(filters.limit || 20);
    }

    return await db.select().from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(filters.limit || 20);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    
    return newActivity;
  }

  // Dashboard analytics
  async getDashboardMetrics(): Promise<{
    activeLeads: number;
    openPositions: number;
    inScreening: number;
    deployed: number;
    pipelineStages: Array<{ stage: string; count: number; percentage: number }>;
    sectorStats: Array<{ sector: string; total: number; filled: number; open: number }>;
  }> {
    // Get basic counts
    const [activeLeadsResult] = await db
      .select({ count: count() })
      .from(volunteers)
      .where(eq(volunteers.status, 'interested'));

    const [openPositionsResult] = await db
      .select({ count: count() })
      .from(positions)
      .where(eq(positions.isOpen, true));

    const [inScreeningResult] = await db
      .select({ count: count() })
      .from(volunteers)
      .where(or(
        eq(volunteers.status, 'screening'),
        eq(volunteers.status, 'medical_screening')
      ));

    const [deployedResult] = await db
      .select({ count: count() })
      .from(placements)
      .where(eq(placements.status, 'active'));

    // Get pipeline stages
    const pipelineResult = await db
      .select({
        status: volunteers.status,
        count: count(),
      })
      .from(volunteers)
      .groupBy(volunteers.status);

    const totalVolunteers = pipelineResult.reduce((sum, stage) => sum + Number(stage.count), 0);
    const pipelineStages = pipelineResult.map(stage => ({
      stage: stage.status || 'unknown',
      count: Number(stage.count),
      percentage: totalVolunteers > 0 ? Math.round((Number(stage.count) / totalVolunteers) * 100) : 0,
    }));

    // Get sector stats
    const sectorResult = await db
      .select({
        sector: positions.sector,
        total: count(),
        filled: sql<number>`COUNT(CASE WHEN ${positions.isOpen} = false THEN 1 END)`,
        open: sql<number>`COUNT(CASE WHEN ${positions.isOpen} = true THEN 1 END)`,
      })
      .from(positions)
      .groupBy(positions.sector);

    const sectorStats = sectorResult.map(sector => ({
      sector: sector.sector || 'unknown',
      total: Number(sector.total),
      filled: Number(sector.filled),
      open: Number(sector.open),
    }));

    return {
      activeLeads: Number(activeLeadsResult.count),
      openPositions: Number(openPositionsResult.count),
      inScreening: Number(inScreeningResult.count),
      deployed: Number(deployedResult.count),
      pipelineStages,
      sectorStats,
    };
  }

  // Urgent items
  async getUrgentItems(): Promise<Array<{
    type: string;
    title: string;
    subtitle: string;
    count: number;
  }>> {
    const urgentItems = [];

    // Medical clearances expiring soon
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30); // 30 days from now

    const [expiringMedical] = await db
      .select({ count: count() })
      .from(medicalScreenings)
      .where(and(
        eq(medicalScreenings.status, 'completed'),
        lte(medicalScreenings.expiresAt, expiringDate)
      ));

    if (Number(expiringMedical.count) > 0) {
      urgentItems.push({
        type: 'medical_expiring',
        title: 'Medical clearance expiring',
        subtitle: `${expiringMedical.count} volunteers - expires in 30 days`,
        count: Number(expiringMedical.count),
      });
    }

    // Pending interviews
    const [pendingInterviews] = await db
      .select({ count: count() })
      .from(applications)
      .where(and(
        eq(applications.status, 'applied'),
        sql`${applications.interviewDate} IS NULL`
      ));

    if (Number(pendingInterviews.count) > 0) {
      urgentItems.push({
        type: 'pending_interviews',
        title: 'Pending interviews',
        subtitle: `${pendingInterviews.count} candidates awaiting scheduling`,
        count: Number(pendingInterviews.count),
      });
    }

    return urgentItems;
  }
}

export const storage = new DatabaseStorage();
