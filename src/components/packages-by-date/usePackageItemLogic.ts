
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';

export function usePackageItemLogic(
  onOpenChat?: (customerId: string, customerName?: string) => void,
  previewRole?: 'admin' | 'employee' | 'traveler',
  disableChat: boolean = false
) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'arrived':
        return 'bg-orange-100 text-orange-800';
      case 'bodega':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const createChatHandler = (customerId: string, customerName?: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenChat && !disableChat && userRole?.role === 'admin') {
      onOpenChat(customerId, customerName);
    }
  };

  const canShowChat = !!(!disableChat && userRole?.role === 'admin' && onOpenChat);

  return {
    getStatusColor,
    createChatHandler,
    canShowChat
  };
}
