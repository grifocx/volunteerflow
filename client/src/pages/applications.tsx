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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, User, Briefcase, Calendar, FileText, Edit } from "lucide-react";
import type { ApplicationWithRelations } from "@shared/schema";

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'medical_screening', label: 'Medical Screening' },
  { value: 'selected', label: 'Selected' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithRelations | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["/api/applications", { status: statusFilter }],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
      setSelectedApplication(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'screening':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'medical_screening':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'selected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'placed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSector = (sector: string) => {
    return sector?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const filteredApplications = applications?.filter((app: ApplicationWithRelations) =>
    !searchTerm || 
    app.volunteer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.volunteer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.position?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Applications" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-applications">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-applications"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="select-status-filter"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Grid */}
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
          ) : filteredApplications && filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredApplications.map((application: ApplicationWithRelations) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg" data-testid={`text-application-title-${application.id}`}>
                            {application.volunteer?.firstName} {application.volunteer?.lastName}
                          </CardTitle>
                          <Badge 
                            className={getStatusColor(application.status)}
                            data-testid={`badge-application-status-${application.id}`}
                          >
                            {STATUS_OPTIONS.find(s => s.value === application.status)?.label || application.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Applied for: {application.position?.title}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedApplication(application)}
                        data-testid={`button-edit-application-${application.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {formatSector(application.position?.sector || '')} - {application.position?.country}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        Applied {formatDate(application.appliedAt)}
                      </div>

                      {application.interviewDate && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          Interview: {formatDate(application.interviewDate)}
                        </div>
                      )}

                      {application.score && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <FileText className="w-4 h-4 mr-2" />
                          Score: {application.score}/100
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <User className="w-4 h-4 mr-2" />
                        {application.volunteer?.email}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No applications found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchTerm || statusFilter
                    ? "Try adjusting your search criteria" 
                    : "Applications will appear here when volunteers apply for positions"
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Application Details Dialog */}
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
              </DialogHeader>
              {selectedApplication && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Volunteer
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedApplication.volunteer?.firstName} {selectedApplication.volunteer?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedApplication.volunteer?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedApplication.position?.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatSector(selectedApplication.position?.sector || '')} - {selectedApplication.position?.country}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <Select 
                      value={selectedApplication.status} 
                      onValueChange={(value) => updateStatusMutation.mutate({ 
                        id: selectedApplication.id, 
                        status: value 
                      })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger data-testid="select-update-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Applied Date
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(selectedApplication.appliedAt)}
                      </p>
                    </div>
                    {selectedApplication.interviewDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Interview Date
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(selectedApplication.interviewDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedApplication.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {selectedApplication.notes}
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
