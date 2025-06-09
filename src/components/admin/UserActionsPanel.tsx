
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';
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
    setActivityTypeFilter
  } = useUserActivities();

  const handleMarkForReview = async (activityId: string) => {
    try {
      toast({
        title: "Acción marcada para revisión",
        description: "Esta actividad ha sido marcada para revisión manual",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la acción para revisión",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Panel de Administración - Actividades de Usuarios
        </CardTitle>
        <CardDescription>
          Monitorea y gestiona las actividades realizadas por los usuarios del sistema
        </CardDescription>
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
        />

        <PanelInformation />
      </CardContent>
    </Card>
  );
}
