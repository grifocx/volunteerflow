import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, type UserRole, type Permission } from '@/lib/rbac';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Role-based access control component following SRP
 * Single responsibility: Control component visibility based on user permissions
 */
export default function RoleGuard({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback = null 
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user?.role) {
    return <>{fallback}</>;
  }

  const userRole = user.role as UserRole;

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(user, permission)
    );
    
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}