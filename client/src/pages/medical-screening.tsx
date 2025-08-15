import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { hasPermission, type UserRole } from "@/lib/rbac";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import RoleGuard from "@/components/common/role-guard";
import MedicalScreeningCard from "@/components/medical/medical-screening-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Eye, FileText, AlertTriangle, CheckCircle, Clock, XCircle, ShieldAlert } from "lucide-react";
import { formatDate } from "date-fns";
import type { MedicalScreening, MedicalScreeningDetails } from "@shared/schema";

/**
 * Medical Screening Management Page following SRP and role-based access control
 * Single responsibility: Manage medical screenings with role-appropriate data access
 */
export default function MedicalScreening() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreening, setSelectedScreening] = useState<MedicalScreening | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Redirect to login if not authenticated (following security patterns)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch medical screenings with role-based access
  const { data: screenings, isLoading: screeningsLoading } = useQuery({
    queryKey: ['/api/medical-screenings', { status: statusFilter, search: searchTerm }],
    retry: false,
    enabled: isAuthenticated && hasPermission(user, 'canViewMedicalScreenings'),
  });

  // Fetch sensitive medical details (Medical Screeners only)
  const { data: medicalDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/medical-screenings', selectedScreening?.id, 'details'],
    retry: false,
    enabled: !!selectedScreening && hasPermission(user, 'canViewMedicalDetails'),
  });

  const createScreeningMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/medical-screenings', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Medical screening created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-screenings'] });
      setShowCreateDialog(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create medical screening",
        variant: "destructive",
      });
    },
  });

  const handleViewOutcome = (id: string) => {
    const screening = (screenings as any)?.find((s: any) => s.id === id);
    setSelectedScreening(screening);
    setShowDetailsDialog(true);
  };

  const handleViewDetails = (id: string) => {
    if (!hasPermission(user, 'canViewMedicalDetails')) {
      toast({
        title: "Access Restricted",
        description: "Medical details are restricted to Medical Screeners only",
        variant: "destructive",
      });
      return;
    }
    
    const screening = (screenings as any)?.find((s: any) => s.id === id);
    setSelectedScreening(screening);
    setShowDetailsDialog(true);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has permission to view medical screenings
  if (!hasPermission(user, 'canViewMedicalScreenings')) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title="Medical Screening" />
          <main className="flex-1 overflow-y-auto p-6">
            <Card className="max-w-2xl mx-auto mt-12">
              <CardHeader className="text-center">
                <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <CardTitle className="text-xl text-red-600">Access Restricted</CardTitle>
                <CardDescription className="text-base">
                  Medical screening information requires specific permissions. 
                  Contact your administrator if you need access.
                </CardDescription>
              </CardHeader>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Medical Screening" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-medical-screening">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Page Header with Role-Based Actions */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Medical Screening Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.role === 'medical_screener' 
                    ? 'Complete medical evaluations and manage screening details'
                    : 'View medical screening outcomes and clearance status'
                  }
                </p>
              </div>
              
              <RoleGuard requiredPermissions={['canManageMedicalScreenings']}>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  data-testid="button-create-screening"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Screening
                </Button>
              </RoleGuard>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search Volunteers</Label>
                    <Input
                      id="search"
                      placeholder="Search by volunteer ID or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      data-testid="button-clear-filters"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screenings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screeningsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (screenings as any)?.length > 0 ? (
                (screenings as any).map((screening: any) => (
                  <MedicalScreeningCard
                    key={screening.id}
                    screening={screening}
                    onViewDetails={handleViewDetails}
                    onViewOutcome={handleViewOutcome}
                  />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No medical screenings found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {statusFilter || searchTerm 
                        ? 'Try adjusting your filters to see more results.'
                        : 'Get started by creating a new medical screening.'
                      }
                    </p>
                    <RoleGuard requiredPermissions={['canManageMedicalScreenings']}>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Screening
                      </Button>
                    </RoleGuard>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Screening Dialog - Medical Screeners Only */}
      <RoleGuard requiredPermissions={['canManageMedicalScreenings']}>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Medical Screening</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="volunteer-select">Select Volunteer</Label>
                <Input
                  id="volunteer-select"
                  placeholder="Enter volunteer ID or search..."
                  data-testid="input-volunteer-select"
                />
              </div>
              
              <div>
                <Label htmlFor="screening-type">Screening Type</Label>
                <Select>
                  <SelectTrigger data-testid="select-screening-type">
                    <SelectValue placeholder="Select screening type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical_clearance">Medical Clearance</SelectItem>
                    <SelectItem value="psychological_evaluation">Psychological Evaluation</SelectItem>
                    <SelectItem value="fitness_assessment">Fitness Assessment</SelectItem>
                    <SelectItem value="vaccination_check">Vaccination Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="initial-notes">Initial Notes</Label>
                <Textarea
                  id="initial-notes"
                  placeholder="Enter any initial observations or requirements..."
                  rows={3}
                  data-testid="textarea-initial-notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Implementation would create the screening
                  setShowCreateDialog(false);
                }}
                data-testid="button-confirm-create"
              >
                Create Screening
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </RoleGuard>

      {/* Screening Details Dialog - Role-Based Content */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Medical Screening - {selectedScreening?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedScreening && (
            <div className="space-y-6">
              {/* Basic Information - Available to All Authorized Roles */}
              <div>
                <h4 className="font-medium mb-3">Screening Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2">
                      {(selectedScreening.status || 'pending').replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <span className="ml-2">
                      {selectedScreening.startedAt 
                        ? formatDate(new Date(selectedScreening.startedAt), 'MMM dd, yyyy')
                        : 'Not started'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Country Restrictions - Visible to Authorized Roles */}
              {selectedScreening.countryRestrictions && selectedScreening.countryRestrictions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Country Restrictions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScreening.countryRestrictions.map((country: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensitive Medical Details - Medical Screeners Only */}
              <RoleGuard requiredPermissions={['canViewMedicalDetails']}>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h4 className="font-medium text-red-700 dark:text-red-400">
                      Restricted Medical Information
                    </h4>
                  </div>
                  {detailsLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ) : medicalDetails ? (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="text-sm font-medium">Medical History:</span>
                        <p className="text-sm mt-1">{(medicalDetails as any).medicalHistory || 'No history recorded'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Current Medications:</span>
                        <p className="text-sm mt-1">{(medicalDetails as any).currentMedications || 'None reported'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Screening Notes:</span>
                        <p className="text-sm mt-1">{(medicalDetails as any).screeningNotes || 'No notes available'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No detailed medical information available
                    </p>
                  )}
                </div>
              </RoleGuard>

              {/* Access Restriction Notice for Non-Medical Roles */}
              <RoleGuard 
                requiredPermissions={['canViewMedicalScreenings']}
                requiredRoles={['recruiter', 'placement_officer', 'country_officer']}
              >
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-orange-500" />
                    <h4 className="font-medium text-orange-700 dark:text-orange-400">
                      Access Restricted
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detailed medical information is restricted to Medical Screeners only. 
                    You can view screening outcomes and country clearance status.
                  </p>
                </div>
              </RoleGuard>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
              data-testid="button-close-details"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}