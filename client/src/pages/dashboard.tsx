import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RoleDashboard from "@/components/common/role-dashboard";
import MetricsCards from "@/components/dashboard/metrics-cards";
import PipelineFunnel from "@/components/dashboard/pipeline-funnel";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import UrgentItems from "@/components/dashboard/urgent-items";
import SectorsOverview from "@/components/dashboard/sectors-overview";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: urgentItems, isLoading: urgentLoading } = useQuery({
    queryKey: ["/api/dashboard/urgent-items"],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activities"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-dashboard">
          {/* Role-Based Dashboard */}
          <div className="mb-8">
            <RoleDashboard />
          </div>

          {/* Pipeline Overview & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {metricsLoading ? (
                <div className="bg-white dark:bg-card rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <PipelineFunnel pipelineStages={(metrics as any)?.pipelineStages || []} />
              )}
            </div>
            
            <div>
              {activitiesLoading ? (
                <div className="bg-white dark:bg-card rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <RecentActivity activities={(activities as any) || []} />
              )}
            </div>
          </div>

          {/* Quick Actions & Urgent Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <QuickActions />
            <div>
              {urgentLoading ? (
                <div className="bg-white dark:bg-card rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <UrgentItems urgentItems={(urgentItems as any) || []} />
              )}
            </div>
          </div>

          {/* Positions by Sector */}
          <div>
            {metricsLoading ? (
              <div className="bg-white dark:bg-card rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <SectorsOverview sectorStats={(metrics as any)?.sectorStats || []} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
