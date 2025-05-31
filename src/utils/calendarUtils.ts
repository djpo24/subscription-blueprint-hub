
export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "scheduled":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Completado";
    case "in_progress":
      return "En Progreso";
    case "scheduled":
      return "Programado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
};
