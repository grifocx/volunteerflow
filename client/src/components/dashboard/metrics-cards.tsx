import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, ClipboardCheck, Globe, ArrowUp } from "lucide-react";

interface MetricsCardsProps {
  metrics?: {
    activeLeads: number;
    openPositions: number;
    inScreening: number;
    deployed: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Active Leads",
      value: metrics?.activeLeads || 0,
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-primary",
      trend: "+12% from last month",
      trendColor: "text-secondary"
    },
    {
      title: "Open Positions", 
      value: metrics?.openPositions || 0,
      icon: Briefcase,
      color: "bg-green-100 dark:bg-green-900", 
      iconColor: "text-secondary",
      trend: "8 new this week",
      trendColor: "text-secondary"
    },
    {
      title: "In Screening",
      value: metrics?.inScreening || 0,
      icon: ClipboardCheck,
      color: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      trend: "Medical & Background",
      trendColor: "text-muted-foreground"
    },
    {
      title: "Deployed",
      value: metrics?.deployed || 0,
      icon: Globe,
      color: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      trend: "Currently serving",
      trendColor: "text-muted-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 ${card.color} rounded-lg`}>
                  <Icon className={`${card.iconColor} h-5 w-5`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100" data-testid={`metric-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {card.value.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${card.trendColor} flex items-center`}>
                  {card.trendColor === "text-secondary" && <ArrowUp className="w-3 h-3 mr-1" />}
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
