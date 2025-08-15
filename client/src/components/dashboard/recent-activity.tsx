import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@shared/schema";

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'volunteer_created':
      case 'application_submitted':
        return "bg-secondary";
      case 'position_created':
        return "bg-primary";
      case 'status_change':
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`activity-dot ${getActivityColor(activity.type)}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100" data-testid={`activity-description-${activity.id}`}>
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`activity-time-${activity.id}`}>
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
        {activities.length > 0 && (
          <div className="mt-6">
            <Button variant="ghost" className="w-full text-sm text-primary hover:text-blue-700 font-medium" data-testid="button-view-all-activity">
              View all activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
