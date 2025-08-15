import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SectorStat {
  sector: string;
  total: number;
  filled: number;
  open: number;
}

interface SectorsOverviewProps {
  sectorStats: SectorStat[];
}

export default function SectorsOverview({ sectorStats }: SectorsOverviewProps) {
  const formatSectorName = (sector: string) => {
    return sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleViewAllPositions = () => {
    // TODO: Navigate to positions page
    console.log("Navigate to all positions");
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Positions by Sector</CardTitle>
            <CardDescription>Current openings across all sectors</CardDescription>
          </div>
          <Button 
            variant="ghost"
            onClick={handleViewAllPositions}
            className="text-sm text-primary hover:text-blue-700 font-medium"
            data-testid="button-view-all-positions"
          >
            View all positions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectorStats.length > 0 ? (
            sectorStats.map((sector, index) => (
              <div key={index} className="sector-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100" data-testid={`sector-name-${sector.sector}`}>
                    {formatSectorName(sector.sector)}
                  </h4>
                  <Badge variant="secondary" data-testid={`sector-open-count-${sector.sector}`}>
                    {sector.open} open
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total positions:</span>
                    <span className="font-medium" data-testid={`sector-total-${sector.sector}`}>
                      {sector.total}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Filled:</span>
                    <span className="font-medium text-secondary" data-testid={`sector-filled-${sector.sector}`}>
                      {sector.filled}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${sector.total > 0 ? (sector.filled / sector.total) * 100 : 0}%` }}
                      data-testid={`sector-progress-${sector.sector}`}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No sector data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
