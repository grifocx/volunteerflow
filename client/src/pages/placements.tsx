import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MapPin, Calendar, User, CheckCircle } from "lucide-react";
import type { Placement } from "@shared/schema";

const PLACEMENT_STATUS_OPTIONS = [
  { value: 'placed', label: 'Placed' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
];

export default function Placements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: placements, isLoading } = useQuery({
    queryKey: ["/api/placements", { status: statusFilter }],
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

  const updatePlacementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Placement> }) => {
      return apiRequest("PATCH", `/api/placements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placements"] });
      toast({
        title: "Success",
        description: "Placement updated successfully",
      });
      setSelectedPlacement(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update placement",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Not set';
  };

  const getVolunteerName = (volunteerId: string) => {
    const volunteer = volunteers?.find((v: any) => v.id === volunteerId);
    return volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : 'Unknown Volunteer';
  };

  const getPositionTitle = (positionId: string) => {
    const position = positions?.find((p: any) => p.id === positionId);
    return position ? position.title : 'Unknown Position';
  };

  const getPositionDetails = (positionId: string) => {
    const position = positions?.find((p: any) => p.id === positionId);
    return position ? `${position.country} - ${position.sector}` : '';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Placements" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-placements">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search placements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-placements"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="select-status-filter"
              >
                <option value="">All Status</option>
                {PLACEMENT_STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Placements Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : placements && placements.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {placements.map((placement: Placement) => (
                <Card 
                  key={placement.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPlacement(placement)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg" data-testid={`text-placement-volunteer-${placement.id}`}>
                            {getVolunteerName(placement.volunteerId)}
                          </CardTitle>
                          <Badge 
                            className={getStatusColor(placement.status)}
                            data-testid={`badge-placement-status-${placement.id}`}
                          >
                            {PLACEMENT_STATUS_OPTIONS.find(s => s.value === placement.status)?.label || placement.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {getPositionTitle(placement.positionId)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {getPositionDetails(placement.positionId)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                      </div>

                      {placement.onboardingCompleted && (
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Onboarding completed {placement.onboardingDate && `on ${formatDate(placement.onboardingDate)}`}
                        </div>
                      )}

                      {placement.supervisor && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <User className="w-4 h-4 mr-2" />
                          Supervisor: {placement.supervisor}
                        </div>
                      )}

                      {placement.actualEndDate && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          Actual end: {formatDate(placement.actualEndDate)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No placements found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchTerm || statusFilter
                    ? "Try adjusting your search criteria" 
                    : "Placements will appear here when volunteers are assigned to positions"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Placement Details Dialog */}
          <Dialog open={!!selectedPlacement} onOpenChange={() => setSelectedPlacement(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Placement Details</DialogTitle>
              </DialogHeader>
              {selectedPlacement && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Volunteer
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getVolunteerName(selectedPlacement.volunteerId)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {getPositionTitle(selectedPlacement.positionId)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getPositionDetails(selectedPlacement.positionId)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <Badge className={getStatusColor(selectedPlacement.status)}>
                        {PLACEMENT_STATUS_OPTIONS.find(s => s.value === selectedPlacement.status)?.label || selectedPlacement.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Onboarding Status
                      </label>
                      <Badge variant={selectedPlacement.onboardingCompleted ? "default" : "secondary"}>
                        {selectedPlacement.onboardingCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedPlacement.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Planned End Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedPlacement.endDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Actual End Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedPlacement.actualEndDate)}
                      </p>
                    </div>
                  </div>

                  {selectedPlacement.supervisor && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Supervisor
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedPlacement.supervisor}
                        </p>
                      </div>
                      {selectedPlacement.supervisorContact && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Supervisor Contact
                          </label>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {selectedPlacement.supervisorContact}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedPlacement.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {selectedPlacement.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
