import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

/**
 * Access denied component following SRP
 * Single responsibility: Display consistent access denied messages across the app
 */
export default function AccessDenied({ 
  title = "Access Restricted",
  message = "You don't have permission to access this section. Contact your administrator if you need access.",
  showBackButton = true 
}: AccessDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <ShieldAlert className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-xl text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {showBackButton && (
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}