
import { useMarkDispatchAsInTransit } from './useMarkDispatchAsInTransit';
import { useMarkTripAsArrived } from './useMarkTripAsArrived';

export function useTripActions() {
  const { markDispatchAsInTransit, isMarkingAsInTransit } = useMarkDispatchAsInTransit();
  const { markTripAsArrived, isMarkingAsArrived } = useMarkTripAsArrived();

  return {
    markTripAsInTransit: markDispatchAsInTransit,
    isMarkingAsInTransit,
    markTripAsArrived: (dispatchId: string) => markTripAsArrived(dispatchId),
    isMarkingAsArrived,
  };
}
