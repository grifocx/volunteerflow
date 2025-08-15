import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, FileText, Heart, Calendar, BarChart3 } from 'lucide-react';
import { type UserRole, getRoleDisplayName } from '@/lib/rbac';

/**
 * Role-specific dashboard component following SRP
 * Single responsibility: Display personalized dashboard based on user role
 */
export default function RoleDashboard() {
  const { user } = useAuth();

  if (!user?.role) {
    return null;
  }

  const role = user.role as UserRole;
  const roleDisplayName = getRoleDisplayName(role);

  const getDashboardContent = () => {
    switch (role) {
      case 'recruiter':
        return {
          title: 'Recruiter Dashboard',
          description: 'Manage leads, applications, and recruitment pipeline',
          quickActions: [
            { icon: Users, label: 'View Leads', href: '/leads', color: 'bg-blue-500' },
            { icon: FileText, label: 'Applications', href: '/applications', color: 'bg-green-500' },
            { icon: BarChart3, label: 'Reports', href: '/reports', color: 'bg-purple-500' },
          ],
          metrics: [
            { label: 'Active Leads', value: '124', change: '+12 this week' },
            { label: 'Applications', value: '45', change: '+5 pending review' },
            { label: 'Interviews Scheduled', value: '8', change: 'This week' },
          ]
        };

      case 'placement_officer':
        return {
          title: 'Placement Officer Dashboard',
          description: 'Manage volunteer placements and assignments',
          quickActions: [
            { icon: MapPin, label: 'Placements', href: '/placements', color: 'bg-orange-500' },
            { icon: FileText, label: 'Applications', href: '/applications', color: 'bg-green-500' },
            { icon: BarChart3, label: 'Reports', href: '/reports', color: 'bg-purple-500' },
          ],
          metrics: [
            { label: 'Active Placements', value: '67', change: '+3 this month' },
            { label: 'Pending Assignments', value: '12', change: 'Awaiting review' },
            { label: 'Completed Projects', value: '156', change: 'Total' },
          ]
        };

      case 'medical_screener':
        return {
          title: 'Medical Screener Dashboard',
          description: 'Conduct medical evaluations and health assessments',
          quickActions: [
            { icon: Heart, label: 'Medical Screening', href: '/medical-screening', color: 'bg-red-500' },
            { icon: Calendar, label: 'Appointments', href: '/appointments', color: 'bg-blue-500' },
            { icon: FileText, label: 'Medical Files', href: '/medical-files', color: 'bg-green-500' },
          ],
          metrics: [
            { label: 'Pending Screenings', value: '23', change: 'Scheduled' },
            { label: 'Completed This Week', value: '18', change: '+6 from last week' },
            { label: 'Clearance Rate', value: '87%', change: 'Above average' },
          ]
        };

      case 'country_officer':
        return {
          title: 'Country Officer Dashboard',
          description: 'Manage in-country operations and position requirements',
          quickActions: [
            { icon: MapPin, label: 'Positions', href: '/positions', color: 'bg-indigo-500' },
            { icon: Users, label: 'Placements', href: '/placements', color: 'bg-orange-500' },
            { icon: BarChart3, label: 'Country Reports', href: '/reports', color: 'bg-purple-500' },
          ],
          metrics: [
            { label: 'Open Positions', value: '34', change: '+8 new this month' },
            { label: 'Volunteers In-Country', value: '89', change: 'Currently active' },
            { label: 'Completion Rate', value: '94%', change: 'This quarter' },
          ]
        };

      default:
        return null;
    }
  };

  const dashboardContent = getDashboardContent();

  if (!dashboardContent) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {dashboardContent.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {dashboardContent.description}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {roleDisplayName}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboardContent.quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {action.label}
                    </h3>
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                      onClick={() => window.location.href = action.href}
                    >
                      Go to {action.label} →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardContent.metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {metric.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}