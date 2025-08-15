import type { RequestHandler } from "express";
import { storage } from "./storage";

export type UserRole = 'recruiter' | 'placement_officer' | 'medical_screener' | 'country_officer';

export interface RolePermissions {
  canViewLeads: boolean;
  canManageLeads: boolean;
  canViewPositions: boolean;
  canManagePositions: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
  canViewMedicalScreenings: boolean;
  canManageMedicalScreenings: boolean;
  canViewMedicalDetails: boolean; // Sensitive medical information
  canViewPlacements: boolean;
  canManagePlacements: boolean;
  canViewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  recruiter: {
    canViewLeads: true,
    canManageLeads: true,
    canViewPositions: true,
    canManagePositions: false,
    canViewApplications: true,
    canManageApplications: true,
    canViewMedicalScreenings: true, // Can see outcomes only
    canManageMedicalScreenings: false,
    canViewMedicalDetails: false, // Cannot see detailed medical reasons
    canViewPlacements: true,
    canManagePlacements: false,
    canViewReports: true,
  },
  placement_officer: {
    canViewLeads: true,
    canManageLeads: false,
    canViewPositions: true,
    canManagePositions: false,
    canViewApplications: true,
    canManageApplications: true,
    canViewMedicalScreenings: true, // Can see outcomes only
    canManageMedicalScreenings: false,
    canViewMedicalDetails: false, // Cannot see detailed medical reasons
    canViewPlacements: true,
    canManagePlacements: true,
    canViewReports: true,
  },
  medical_screener: {
    canViewLeads: false,
    canManageLeads: false,
    canViewPositions: false,
    canManagePositions: false,
    canViewApplications: true,
    canManageApplications: false,
    canViewMedicalScreenings: true,
    canManageMedicalScreenings: true,
    canViewMedicalDetails: true, // Can see all medical details and reasons
    canViewPlacements: false,
    canManagePlacements: false,
    canViewReports: false,
  },
  country_officer: {
    canViewLeads: false,
    canManageLeads: false,
    canViewPositions: true,
    canManagePositions: true, // Creates positions (demand side)
    canViewApplications: true,
    canManageApplications: false,
    canViewMedicalScreenings: true, // Can see outcomes only
    canManageMedicalScreenings: false,
    canViewMedicalDetails: false, // Cannot see detailed medical reasons
    canViewPlacements: true,
    canManagePlacements: true,
    canViewReports: true,
  },
};

export function requirePermission(permission: keyof RolePermissions): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user?.role) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userPermissions = ROLE_PERMISSIONS[user.role as UserRole];
      if (!userPermissions || !userPermissions[permission]) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user?.role || !roles.includes(user.role as UserRole)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      console.error("Error checking role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}