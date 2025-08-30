
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainTabs } from '@/components/MainTabs';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-auto">
              <MainTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
