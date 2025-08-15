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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, User, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { MedicalScreening } from "@shared/schema";

const MEDICAL_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'expired', label: 'Expired' },
  { value: 'failed', label: 'Failed' },
];

export default function MedicalScreening() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedScreening, setSelectedScreening] = useState<MedicalScreening | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: screenings, isLoading } = useQuery({
    queryKey: ["/api/medical-screenings", { status: statusFilter }],
    retry: false,
  });

  const updateScreeningMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MedicalScreening> }) => {
      return apiRequest("PATCH", `/api/medical-screenings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-screenings"] });
      toast({
        title: "Success",
        description: "Medical screening updated successfully",
      });
      setSelectedScreening(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update medical screening",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'Not set';
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Medical Screening" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-medical-screening">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medical screenings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-screenings"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="select-status-filter"
              >
                <option value="">All Status</option>
                {MEDICAL_STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medical Screenings Grid */}
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
          ) : screenings && screenings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {screenings.map((screening: MedicalScreening) => (
                <Card 
                  key={screening.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    isExpiringSoon(screening.expiresAt) ? 'border-red-200 dark:border-red-800' : ''
                  }`}
                  onClick={() => setSelectedScreening(screening)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(screening.status)}
                          <CardTitle className="text-lg" data-testid={`text-screening-volunteer-${screening.id}`}>
                            Volunteer ID: {screening.volunteerId.slice(-8)}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={getStatusColor(screening.status)}
                            data-testid={`badge-screening-status-${screening.id}`}
                          >
                            {MEDICAL_STATUS_OPTIONS.find(s => s.value === screening.status)?.label || screening.status}
                          </Badge>
                          {isExpiringSoon(screening.expiresAt) && (
                            <Badge variant="destructive" className="text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {screening.startedAt && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          Started: {formatDate(screening.startedAt)}
                        </div>
                      )}
                      
                      {screening.completedAt && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed: {formatDate(screening.completedAt)}
                        </div>
                      )}

                      {screening.expiresAt && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          Expires: {formatDate(screening.expiresAt)}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${screening.vaccinationsComplete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Vaccinations
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${screening.medicalClearance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Medical
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${screening.mentalHealthClearance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Mental Health
                          </div>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${screening.backgroundCheck ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            Background
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No medical screenings found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchTerm || statusFilter
                    ? "Try adjusting your search criteria" 
                    : "Medical screenings will appear here when volunteers begin the process"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Medical Screening Details Dialog */}
          <Dialog open={!!selectedScreening} onOpenChange={() => setSelectedScreening(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Medical Screening Details</DialogTitle>
              </DialogHeader>
              {selectedScreening && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Volunteer ID
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedScreening.volunteerId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <Badge className={getStatusColor(selectedScreening.status)}>
                        {MEDICAL_STATUS_OPTIONS.find(s => s.value === selectedScreening.status)?.label || selectedScreening.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Started
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedScreening.startedAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Completed
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedScreening.completedAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expires
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedScreening.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Screening Checklist
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="vaccinations"
                          checked={selectedScreening.vaccinationsComplete}
                          onCheckedChange={(checked) => {
                            updateScreeningMutation.mutate({
                              id: selectedScreening.id,
                              data: { vaccinationsComplete: checked as boolean }
                            });
                          }}
                          data-testid="checkbox-vaccinations"
                        />
                        <label htmlFor="vaccinations" className="text-sm">
                          Vaccinations Complete
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="medical"
                          checked={selectedScreening.medicalClearance}
                          onCheckedChange={(checked) => {
                            updateScreeningMutation.mutate({
                              id: selectedScreening.id,
                              data: { medicalClearance: checked as boolean }
                            });
                          }}
                          data-testid="checkbox-medical"
                        />
                        <label htmlFor="medical" className="text-sm">
                          Medical Clearance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mental"
                          checked={selectedScreening.mentalHealthClearance}
                          onCheckedChange={(checked) => {
                            updateScreeningMutation.mutate({
                              id: selectedScreening.id,
                              data: { mentalHealthClearance: checked as boolean }
                            });
                          }}
                          data-testid="checkbox-mental-health"
                        />
                        <label htmlFor="mental" className="text-sm">
                          Mental Health Clearance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="background"
                          checked={selectedScreening.backgroundCheck}
                          onCheckedChange={(checked) => {
                            updateScreeningMutation.mutate({
                              id: selectedScreening.id,
                              data: { backgroundCheck: checked as boolean }
                            });
                          }}
                          data-testid="checkbox-background"
                        />
                        <label htmlFor="background" className="text-sm">
                          Background Check
                        </label>
                      </div>
                    </div>
                  </div>

                  {selectedScreening.medicalNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Medical Notes
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {selectedScreening.medicalNotes}
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
