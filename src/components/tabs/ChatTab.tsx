import { ChatView } from '@/components/ChatView';
import React from 'react';
import { ProfileImageMigration } from '@/components/ProfileImageMigration';
import { ProfileImageTest } from '@/components/ProfileImageTest';
export function ChatTab() {
  return <div className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      {/* Migración y test de fotos de perfil */}
      
      
      <ChatView />
    </div>;
}