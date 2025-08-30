import { useState } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainTabs } from '@/components/MainTabs';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { QuickActions } from '@/components/QuickActions';
import { PackageFormDialog } from '@/components/PackageFormDialog';
import { TripFormDialog } from '@/components/TripFormDialog';
import { NotificationPanel } from '@/components/NotificationPanel';
import { MobileDeliveryInterface } from '@/components/MobileDeliveryInterface';
import { RolePreview } from '@/components/RolePreview';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileDelivery, setShowMobileDelivery] = useState(false);

  const isMobile = useIsMobile();

  return (
    <RolePreview>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset className="flex-1">
            {showMobileDelivery && (
              <MobileDeliveryInterface onClose={() => setShowMobileDelivery(false)} />
            )}
            {!showMobileDelivery && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {!isMobile && (
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                    <QuickActions
                      onNewPackage={() => setShowPackageForm(true)}
                      onNewTrip={() => setShowTripForm(true)}
                      onViewNotifications={() => setShowNotifications(true)}
                      onMobileDelivery={() => setShowMobileDelivery(true)}
                    />
                  </div>
                )}
                
                <MainTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            )}
          </SidebarInset>
        </div>

        <PackageFormDialog 
          open={showPackageForm} 
          onOpenChange={setShowPackageForm}
        />
        <TripFormDialog 
          open={showTripForm} 
          onOpenChange={setShowTripForm}
        />
        <NotificationPanel 
          open={showNotifications} 
          onOpenChange={setShowNotifications}
        />
      </SidebarProvider>
    </RolePreview>
  );
}
