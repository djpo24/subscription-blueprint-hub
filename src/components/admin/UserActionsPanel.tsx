
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserActivities } from './hooks/useUserActivities';
import { ActivityFilters } from './ActivityFilters';
import { ActivitiesTable } from './ActivitiesTable';
import { PanelInformation } from './PanelInformation';

export function UserActionsPanel() {
  const { toast } = useToast();
  const {
    filteredActivities,
    isLoading,
    searchTerm,
    setSearchTerm,
    activityTypeFilter,
    setActivityTypeFilter,
    refetch
  } = useUserActivities();

  const handleMarkForReview = async (activityId: string) => {
    try {
      console.log('Marking activity for review:', activityId);
      toast({
        title: "Acción marcada para revisión",
        description: "Esta actividad ha sido marcada para revisión manual",
      });
    } catch (error) {
      console.error('Error marking activity for review:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la acción para revisión",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Panel de Administración - Actividades de Usuarios
            </CardTitle>
            <CardDescription>
              Monitorea y gestiona las actividades realizadas por los usuarios del sistema
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActivityFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activityTypeFilter={activityTypeFilter}
          onActivityTypeChange={setActivityTypeFilter}
        />

        <ActivitiesTable
          activities={filteredActivities}
          isLoading={isLoading}
          onMarkForReview={handleMarkForReview}
          onRefresh={handleRefresh}
        />

        <PanelInformation />
      </CardContent>
    </Card>
  );
}
