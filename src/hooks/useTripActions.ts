
import { useMarkTripAsInTransit } from './useMarkTripAsInTransit';
import { useMarkTripAsArrived } from './useMarkTripAsArrived';

export function useTripActions() {
  const { markTripAsInTransit, isMarkingAsInTransit } = useMarkTripAsInTransit();
  const { markTripAsArrived, isMarkingAsArrived } = useMarkTripAsArrived();

  return {
    markTripAsInTransit,
    isMarkingAsInTransit,
    markTripAsArrived,
    isMarkingAsArrived,
  };
}
