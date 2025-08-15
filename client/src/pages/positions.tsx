import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, MapPin, Calendar, Users, Briefcase } from "lucide-react";
import PositionForm from "@/components/forms/position-form";
import type { PositionWithRelations } from "@shared/schema";

const SECTORS = [
  'education',
  'healthcare', 
  'agriculture',
  'environment',
  'technology',
  'community_development'
];

export default function Positions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [isOpenFilter, setIsOpenFilter] = useState("");
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);

  const { data: positions, isLoading } = useQuery({
    queryKey: ["/api/positions", { 
      search: searchTerm, 
      sector: sectorFilter,
      isOpen: isOpenFilter ? isOpenFilter === 'true' : undefined
    }],
    retry: false,
  });

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'education':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'healthcare':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'agriculture':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'environment':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'technology':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'community_development':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSector = (sector: string) => {
    return sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Positions" />
        
        <main className="flex-1 overflow-y-auto p-6" data-testid="main-positions">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-positions"
                />
              </div>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="select-sector-filter"
              >
                <option value="">All Sectors</option>
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>
                    {formatSector(sector)}
                  </option>
                ))}
              </select>
              <select
                value={isOpenFilter}
                onChange={(e) => setIsOpenFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="select-status-filter"
              >
                <option value="">All Status</option>
                <option value="true">Open</option>
                <option value="false">Closed</option>
              </select>
            </div>
            <Dialog open={isAddPositionOpen} onOpenChange={setIsAddPositionOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-position">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Position
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Position</DialogTitle>
                </DialogHeader>
                <PositionForm onSuccess={() => setIsAddPositionOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Positions Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          ) : positions && positions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {positions.map((position: PositionWithRelations) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg" data-testid={`text-position-title-${position.id}`}>
                            {position.title}
                          </CardTitle>
                          <Badge 
                            variant={position.isOpen ? "default" : "secondary"}
                            data-testid={`badge-position-status-${position.id}`}
                          >
                            {position.isOpen ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <Badge 
                          className={getSectorColor(position.sector)} 
                          data-testid={`badge-position-sector-${position.id}`}
                        >
                          {formatSector(position.sector)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {position.location ? `${position.location}, ` : ''}{position.country}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(position.startDate)} - {formatDate(position.endDate)}
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2" />
                        {position.currentVolunteers || 0} / {position.maxVolunteers} volunteers
                      </div>

                      {position.applications && position.applications.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {position.applications.length} application{position.applications.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {position.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No positions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  {searchTerm || sectorFilter || isOpenFilter
                    ? "Try adjusting your search criteria" 
                    : "Get started by creating your first position"
                  }
                </p>
                {!searchTerm && !sectorFilter && !isOpenFilter && (
                  <Button onClick={() => setIsAddPositionOpen(true)} data-testid="button-create-first-position">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Position
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
