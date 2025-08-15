import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, FileText, Calendar } from 'lucide-react';
import { formatDate } from 'date-fns';
import RoleGuard from '@/components/common/role-guard';
import type { MedicalScreening } from '@shared/schema';

interface MedicalScreeningCardProps {
  screening: MedicalScreening;
  onViewDetails?: (id: string) => void;
  onViewOutcome?: (id: string) => void;
}

/**
 * Medical screening display component following SRP
 * Single responsibility: Display medical screening information with role-based content
 */
export default function MedicalScreeningCard({ 
  screening, 
  onViewDetails, 
  onViewOutcome 
}: MedicalScreeningCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cleared': return 'bg-green-100 text-green-800';
      case 'not_cleared': return 'bg-red-100 text-red-800';
      case 'requires_follow_up': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card data-testid={`medical-screening-card-${screening.id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Medical Screening</CardTitle>
            <p className="text-sm text-muted-foreground">
              Volunteer ID: {screening.volunteerId}
            </p>
          </div>
          <Badge className={getStatusColor(screening.status || 'pending')}>
            {(screening.status || 'pending').replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Started</p>
            <p className="font-medium">
              {screening.startedAt ? formatDate(new Date(screening.startedAt), 'MMM dd, yyyy') : 'Not started'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expires</p>
            <p className="font-medium">
              {screening.expiresAt ? formatDate(new Date(screening.expiresAt), 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Result summary - visible to all authorized roles */}
        {screening.notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Notes</p>
            <p className="text-sm text-muted-foreground">{screening.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          {/* Outcome view - available to all roles with medical screening permissions */}
          <RoleGuard requiredPermissions={['canViewMedicalScreenings']}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewOutcome?.(screening.id)}
              data-testid={`button-view-outcome-${screening.id}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              View Outcome
            </Button>
          </RoleGuard>

          {/* Detailed medical information - restricted to Medical Screeners only */}
          <RoleGuard requiredPermissions={['canViewMedicalDetails']}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails?.(screening.id)}
              data-testid={`button-view-details-${screening.id}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </RoleGuard>

          {/* Hide sensitive details from non-medical roles */}
          <RoleGuard 
            requiredPermissions={['canViewMedicalScreenings']}
            requiredRoles={['recruiter', 'placement_officer', 'country_officer']}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              disabled
              title="Medical details restricted to Medical Screeners"
              data-testid={`button-restricted-details-${screening.id}`}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Details Restricted
            </Button>
          </RoleGuard>
        </div>
      </CardContent>
    </Card>
  );
}