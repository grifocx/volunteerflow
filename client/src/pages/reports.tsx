import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, PieChart, Download, Calendar, Users, TrendingUp, Globe } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("overview");
  const [timeframe, setTimeframe] = useState("month");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: volunteers } = useQuery({
    queryKey: ["/api/volunteers"],
    retry: false,
  });

  const { data: positions } = useQuery({
    queryKey: ["/api/positions"],
    retry: false,
  });

  const { data: applications } = useQuery({
    queryKey: ["/api/applications"],
    retry: false,
  });

  const handleExportReport = () => {
    // Implementation would generate and download the selected report
    console.log("Exporting report:", reportType, timeframe);
  };

  const formatSector = (sector: string) => {
    return sector?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const getStatusStats = () => {
    if (!volunteers) return [];
    
    const statusCounts = volunteers.reduce((acc: any, volunteer: any) => {
      acc[volunteer.status] = (acc[volunteer.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: Math.round((count as number / volunteers.length) * 100)
    }));
  };

  const getCountryStats = () => {
    if (!positions) return [];
    
    const countryCounts = positions.reduce((acc: any, position: any) => {
      acc[position.country] = (acc[position.country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);
  };

  const getApplicationTrends = () => {
    if (!applications) return [];
    
    const monthlyData = applications.reduce((acc: any, app: any) => {
      const month = new Date(app.appliedAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Reports & Analytics" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-reports">
          {/* Report Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48" data-testid="select-report-type">
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Report</SelectItem>
                  <SelectItem value="pipeline">Pipeline Analysis</SelectItem>
                  <SelectItem value="geographic">Geographic Distribution</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-40" data-testid="select-timeframe">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleExportReport} data-testid="button-export-report">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-total-volunteers">
                  {volunteers?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all statuses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-open-positions">
                  {metrics?.openPositions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Available for applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-total-applications">
                  {applications?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="metric-conversion-rate">
                  {volunteers && applications 
                    ? Math.round((applications.length / volunteers.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Lead to application
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Report Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pipeline Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Pipeline Status Distribution
                </CardTitle>
                <CardDescription>
                  Current volunteer status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getStatusStats().length > 0 ? (
                  <div className="space-y-3">
                    {getStatusStats().map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-primary`} style={{
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}></div>
                          <span className="text-sm font-medium">{stat.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{stat.count}</span>
                          <Badge variant="secondary">{stat.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Sector Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Sector Distribution
                </CardTitle>
                <CardDescription>
                  Position distribution across sectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics?.sectorStats ? (
                  <div className="space-y-3">
                    {metrics.sectorStats.map((sector: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{formatSector(sector.sector)}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {sector.filled}/{sector.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full" 
                            style={{ width: `${sector.total > 0 ? (sector.filled / sector.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Geographic and Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Top Countries by Positions
                </CardTitle>
                <CardDescription>
                  Countries with the most volunteer positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getCountryStats().length > 0 ? (
                  <div className="space-y-3">
                    {getCountryStats().map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium">{stat.country}</span>
                        </div>
                        <Badge variant="secondary">{stat.count} positions</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Application Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Application Trends
                </CardTitle>
                <CardDescription>
                  Monthly application volume
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getApplicationTrends().length > 0 ? (
                  <div className="space-y-3">
                    {getApplicationTrends().slice(-6).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{trend.month}</span>
                        </div>
                        <Badge variant="outline">{trend.count} applications</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
