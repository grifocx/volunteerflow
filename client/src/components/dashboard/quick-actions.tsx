import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Briefcase, Calendar, BarChart3 } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Add New Lead",
      icon: UserPlus,
      action: "addNewLead",
      description: "Register a new volunteer interest"
    },
    {
      title: "Create Position", 
      icon: Briefcase,
      action: "createPosition",
      description: "Post a new volunteer opportunity"
    },
    {
      title: "Schedule Interview",
      icon: Calendar, 
      action: "scheduleInterview",
      description: "Set up candidate interviews"
    },
    {
      title: "Generate Report",
      icon: BarChart3,
      action: "generateReport", 
      description: "Create analytics reports"
    }
  ];

  const handleQuickAction = (action: string) => {
    // TODO: Implement modal/form opening for each action
    console.log("Quick action:", action);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common recruitment tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="quick-action-button group"
                data-testid={`button-quick-${action.action.toLowerCase().replace(/([A-Z])/g, '-$1')}`}
              >
                <Icon className="text-2xl text-gray-400 group-hover:text-primary mb-2 h-8 w-8" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
