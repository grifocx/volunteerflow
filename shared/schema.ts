import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  pgEnum,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("recruitment_manager"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const statusEnum = pgEnum('status', [
  'interested',
  'applied',
  'screening',
  'medical_screening',
  'selected',
  'placed',
  'onboarded',
  'rejected',
  'withdrawn'
]);

export const sectorEnum = pgEnum('sector', [
  'education',
  'healthcare',
  'agriculture',
  'environment',
  'technology',
  'community_development'
]);

export const medicalStatusEnum = pgEnum('medical_status', [
  'not_started',
  'in_progress',
  'completed',
  'expired',
  'failed'
]);

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high',
  'urgent'
]);

// Core business tables
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  nationality: varchar("nationality"),
  currentCountry: varchar("current_country"),
  education: text("education"),
  experience: text("experience"),
  skills: text("skills").array(),
  languages: text("languages").array(),
  motivation: text("motivation"),
  availability: date("availability"),
  status: statusEnum("status").default('interested'),
  source: varchar("source"), // How they heard about us
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  sector: sectorEnum("sector").notNull(),
  country: varchar("country").notNull(),
  location: varchar("location"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(), // Always 27 months from start
  requirements: text("requirements").array(),
  responsibilities: text("responsibilities").array(),
  isOpen: boolean("is_open").default(true),
  maxVolunteers: integer("max_volunteers").default(1),
  currentVolunteers: integer("current_volunteers").default(0),
  priority: priorityEnum("priority").default('medium'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").notNull().references(() => volunteers.id),
  positionId: varchar("position_id").notNull().references(() => positions.id),
  status: statusEnum("status").default('applied'),
  appliedAt: timestamp("applied_at").defaultNow(),
  interviewDate: timestamp("interview_date"),
  interviewNotes: text("interview_notes"),
  score: integer("score"), // Interview/assessment score
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const medicalScreenings = pgTable("medical_screenings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").notNull().references(() => volunteers.id),
  status: medicalStatusEnum("status").default('not_started'),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  vaccinationsComplete: boolean("vaccinations_complete").default(false),
  medicalClearance: boolean("medical_clearance").default(false),
  mentalHealthClearance: boolean("mental_health_clearance").default(false),
  backgroundCheck: boolean("background_check").default(false),
  emergencyContact: jsonb("emergency_contact"),
  medicalNotes: text("medical_notes"),
  documents: text("documents").array(), // URLs to uploaded documents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const placements = pgTable("placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  volunteerId: varchar("volunteer_id").notNull().references(() => volunteers.id),
  positionId: varchar("position_id").notNull().references(() => positions.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  actualEndDate: date("actual_end_date"),
  status: varchar("status").default('placed'), // placed, active, completed, terminated
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingDate: date("onboarding_date"),
  supervisor: varchar("supervisor"),
  supervisorContact: varchar("supervisor_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // status_change, interview_scheduled, document_uploaded, etc.
  description: text("description").notNull(),
  volunteerId: varchar("volunteer_id").references(() => volunteers.id),
  positionId: varchar("position_id").references(() => positions.id),
  applicationId: varchar("application_id").references(() => applications.id),
  userId: varchar("user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const volunteersRelations = relations(volunteers, ({ many }) => ({
  applications: many(applications),
  medicalScreenings: many(medicalScreenings),
  placements: many(placements),
  activities: many(activities),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  applications: many(applications),
  placements: many(placements),
  activities: many(activities),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  volunteer: one(volunteers, {
    fields: [applications.volunteerId],
    references: [volunteers.id],
  }),
  position: one(positions, {
    fields: [applications.positionId],
    references: [positions.id],
  }),
  activities: many(activities),
}));

export const medicalScreeningsRelations = relations(medicalScreenings, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [medicalScreenings.volunteerId],
    references: [volunteers.id],
  }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [placements.volunteerId],
    references: [volunteers.id],
  }),
  position: one(positions, {
    fields: [placements.positionId],
    references: [positions.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  volunteer: one(volunteers, {
    fields: [activities.volunteerId],
    references: [volunteers.id],
  }),
  position: one(positions, {
    fields: [activities.positionId],
    references: [positions.id],
  }),
  application: one(applications, {
    fields: [activities.applicationId],
    references: [applications.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalScreeningSchema = createInsertSchema(medicalScreenings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Volunteer = typeof volunteers.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type MedicalScreening = typeof medicalScreenings.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertMedicalScreening = z.infer<typeof insertMedicalScreeningSchema>;
export type InsertPlacement = z.infer<typeof insertPlacementSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended types with relations
export type VolunteerWithRelations = Volunteer & {
  applications?: ApplicationWithRelations[];
  medicalScreenings?: MedicalScreening[];
  placements?: PlacementWithRelations[];
};

export type PositionWithRelations = Position & {
  applications?: ApplicationWithRelations[];
  placements?: PlacementWithRelations[];
};

export type ApplicationWithRelations = Application & {
  volunteer?: Volunteer;
  position?: Position;
};

export type PlacementWithRelations = Placement & {
  volunteer?: Volunteer;
  position?: Position;
};
