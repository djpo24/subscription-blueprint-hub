
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export function ChatViewHeader() {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sistema de Chat WhatsApp
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
