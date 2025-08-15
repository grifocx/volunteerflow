import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { getUserDashboardSections } from "@/lib/rbac";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Positions from "@/pages/positions";
import Applications from "@/pages/applications";
import MedicalScreening from "@/pages/medical-screening";
import Placements from "@/pages/placements";
import Reports from "@/pages/reports";
import { useEffect } from "react";

function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { user, hasPermission } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!user) return;
    
    // Check permissions based on path
    const permissionMap: Record<string, keyof import("@/lib/rbac").RolePermissions> = {
      '/leads': 'canViewLeads',
      '/positions': 'canViewPositions',
      '/applications': 'canViewApplications',
      '/medical-screening': 'canViewMedicalScreenings',
      '/placements': 'canViewPlacements',
      '/reports': 'canViewReports',
    };
    
    const requiredPermission = permissionMap[path];
    if (requiredPermission && !hasPermission(requiredPermission)) {
      // Redirect to the first available section for their role
      const availableSections = getUserDashboardSections(user);
      if (availableSections.length > 0) {
        setLocation(`/${availableSections[0]}`);
      } else {
        setLocation('/');
      }
    }
  }, [path, user, hasPermission, setLocation]);

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/leads">
            <ProtectedRoute path="/leads" component={Leads} />
          </Route>
          <Route path="/positions">
            <ProtectedRoute path="/positions" component={Positions} />
          </Route>
          <Route path="/applications">
            <ProtectedRoute path="/applications" component={Applications} />
          </Route>
          <Route path="/medical-screening">
            <ProtectedRoute path="/medical-screening" component={MedicalScreening} />
          </Route>
          <Route path="/placements">
            <ProtectedRoute path="/placements" component={Placements} />
          </Route>
          <Route path="/reports">
            <ProtectedRoute path="/reports" component={Reports} />
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
