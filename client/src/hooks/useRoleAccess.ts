import { useAuth } from '@/hooks/useAuth';
import { hasPermission, type UserRole, type Permission } from '@/lib/rbac';

/**
 * Role-based access control hook following SRP
 * Single responsibility: Provide role access utilities for components
 */
export function useRoleAccess() {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(user, permission);
  };

  const checkRole = (roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role as UserRole);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const getUserRole = (): UserRole | null => {
    return (user?.role as UserRole) || null;
  };

  return {
    user,
    checkPermission,
    checkRole,
    isRole,
    getUserRole,
    isRecruiter: isRole('recruiter'),
    isPlacementOfficer: isRole('placement_officer'),
    isMedicalScreener: isRole('medical_screener'),
    isCountryOfficer: isRole('country_officer'),
    canViewLeads: checkPermission('canViewLeads'),
    canManageLeads: checkPermission('canManageLeads'),
    canViewPositions: checkPermission('canViewPositions'),
    canManagePositions: checkPermission('canManagePositions'),
    canViewApplications: checkPermission('canViewApplications'),
    canManageApplications: checkPermission('canManageApplications'),
    canViewMedicalScreenings: checkPermission('canViewMedicalScreenings'),
    canManageMedicalScreenings: checkPermission('canManageMedicalScreenings'),
    canViewMedicalDetails: checkPermission('canViewMedicalDetails'),
    canViewPlacements: checkPermission('canViewPlacements'),
    canManagePlacements: checkPermission('canManagePlacements'),
    canViewReports: checkPermission('canViewReports'),
  };
}