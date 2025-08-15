import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { hasPermission, UserRole } from "@/lib/rbac";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    throwOnError: false,
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        return null; // Not authenticated, return null instead of throwing
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return response.json();
    }
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
