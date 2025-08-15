import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { hasPermission, UserRole } from "@/lib/rbac";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission: (permission: keyof import("@/lib/rbac").RolePermissions) => 
      hasPermission(user, permission),
    userRole: user?.role as UserRole,
  };
}
