import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DevUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function DevLogin() {
  const queryClient = useQueryClient();
  const [loggingInUserId, setLoggingInUserId] = useState<string | null>(null);
  
  // Get available dev users
  const { data: devUsers, isLoading } = useQuery<DevUser[]>({
    queryKey: ['/api/dev/users'],
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (userId: string) => {
      setLoggingInUserId(userId);
      const response = await fetch('/api/dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate user query to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Refresh the page to update auth state
      window.location.reload();
    },
    onError: () => {
      setLoggingInUserId(null);
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'placement_officer': return 'bg-green-100 text-green-800';
      case 'medical_screener': return 'bg-purple-100 text-purple-800';
      case 'country_officer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading development users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Development Login</CardTitle>
          <CardDescription>
            Choose a user role to test the application with different permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {devUsers?.map((user) => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      onClick={() => loginMutation.mutate(user.id)}
                      disabled={loggingInUserId === user.id}
                      data-testid={`login-${user.role}`}
                    >
                      {loggingInUserId === user.id ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h4 className="font-medium mb-2">Role Permissions:</h4>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Recruiter:</strong> Manage volunteers, leads, and applications</li>
              <li><strong>Placement Officer:</strong> Manage positions and volunteer placements</li>
              <li><strong>Medical Screener:</strong> Access medical screening data</li>
              <li><strong>Country Officer:</strong> Manage country-specific operations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}