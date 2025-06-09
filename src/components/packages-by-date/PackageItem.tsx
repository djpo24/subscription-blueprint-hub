
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageItemMobile } from './PackageItemMobile';
import { PackageItemDesktop } from './PackageItemDesktop';
import { usePackageItemLogic } from './usePackageItemLogic';
import type { PackageItemProps } from './types';

export function PackageItem({ 
  package: pkg, 
  onClick, 
  onOpenChat,
  previewRole,
  disableChat = false
}: PackageItemProps) {
  const isMobile = useIsMobile();
  const packageItemLogic = usePackageItemLogic(
    onOpenChat,
    previewRole,
    disableChat
  );

  const handleChatClick = packageItemLogic.createChatHandler(pkg.customer_id, pkg.customers?.name);

  const sharedProps = {
    package: pkg,
    onClick,
    onOpenChat,
    previewRole,
    disableChat,
    getStatusColor: packageItemLogic.getStatusColor,
    handleChatClick,
    canShowChat: packageItemLogic.canShowChat
  };

  if (isMobile) {
    return <PackageItemMobile {...sharedProps} />;
  }

  return <PackageItemDesktop {...sharedProps} />;
}
