import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FileText } from "lucide-react";

interface UrgentItem {
  type: string;
  title: string;
  subtitle: string;
  count: number;
}

interface UrgentItemsProps {
  urgentItems: UrgentItem[];
}

export default function UrgentItems({ urgentItems }: UrgentItemsProps) {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'medical_expiring':
        return AlertTriangle;
      case 'pending_interviews':
        return Clock;
      case 'incomplete_applications':
        return FileText;
      default:
        return AlertTriangle;
    }
  };

  const getItemStyle = (type: string) => {
    switch (type) {
      case 'medical_expiring':
        return "urgent-item red";
      case 'pending_interviews':
        return "urgent-item yellow";
      case 'incomplete_applications':
        return "urgent-item blue";
      default:
        return "urgent-item red";
    }
  };

  const handleViewDetails = (type: string) => {
    // TODO: Navigate to relevant page with filters
    console.log("View details for:", type);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Requires Attention</CardTitle>
            <CardDescription>Items needing immediate action</CardDescription>
          </div>
          {urgentItems.length > 0 && (
            <Badge variant="destructive" data-testid="urgent-count-badge">
              {urgentItems.length} urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {urgentItems.length > 0 ? (
            urgentItems.map((item, index) => {
              const Icon = getItemIcon(item.type);
              
              return (
                <div key={index} className={getItemStyle(item.type)}>
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid={`urgent-item-title-${index}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`urgent-item-subtitle-${index}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(item.type)}
                    className="text-xs text-primary hover:text-blue-700 font-medium"
                    data-testid={`button-view-urgent-${index}`}
                  >
                    View
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No urgent items</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                All tasks are up to date
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
