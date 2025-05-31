
interface PackageRouteDisplayProps {
  status: string;
  origin: string;
  destination: string;
}

export function PackageRouteDisplay({ status, origin, destination }: PackageRouteDisplayProps) {
  if (status === 'warehouse') {
    return <span className="text-sm text-gray-500">En Bodega</span>;
  }

  return (
    <div className="flex items-center">
      <span className="text-sm">{origin}</span>
      <span className="mx-2">→</span>
      <span className="text-sm">{destination}</span>
    </div>
  );
}
