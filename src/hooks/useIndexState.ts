
import { useState } from 'react';

export function useIndexState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [viewingPackagesByDate, setViewingPackagesByDate] = useState<Date | null>(null);

  return {
    searchTerm,
    setSearchTerm,
    packageDialogOpen,
    setPackageDialogOpen,
    tripDialogOpen,
    setTripDialogOpen,
    selectedTripId,
    setSelectedTripId,
    selectedDate,
    setSelectedDate,
    viewingPackagesByDate,
    setViewingPackagesByDate,
  };
}
