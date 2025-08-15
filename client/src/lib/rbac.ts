import { User } from "@shared/schema";

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
  canManageUsers: boolean;
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
    canManageUsers: false,
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
    canManageUsers: false,
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
    canManageUsers: false,
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
    canManageUsers: false,
  },
};

export function hasPermission(user: User | undefined, permission: keyof RolePermissions): boolean {
  if (!user?.role) return false;
  const permissions = ROLE_PERMISSIONS[user.role as UserRole];
  return permissions?.[permission] || false;
}

export function getUserDashboardSections(user: User | undefined): string[] {
  if (!user?.role) return [];
  
  const role = user.role as UserRole;
  const sections: string[] = [];
  
  if (ROLE_PERMISSIONS[role].canViewLeads) sections.push('leads');
  if (ROLE_PERMISSIONS[role].canViewPositions) sections.push('positions');
  if (ROLE_PERMISSIONS[role].canViewApplications) sections.push('applications');
  if (ROLE_PERMISSIONS[role].canViewMedicalScreenings) sections.push('medical-screening');
  if (ROLE_PERMISSIONS[role].canViewPlacements) sections.push('placements');
  if (ROLE_PERMISSIONS[role].canViewReports) sections.push('reports');
  
  return sections;
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    recruiter: 'Recruiter',
    placement_officer: 'Placement Officer',
    medical_screener: 'Medical Screener',
    country_officer: 'Country Officer',
  };
  return roleNames[role];
}