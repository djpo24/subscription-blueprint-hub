
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { CustomerInfoDialog } from './CustomerInfoDialog';

interface CustomerInfoButtonProps {
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
}

export function CustomerInfoButton({
  customerId,
  customerName,
  customerPhone
}: CustomerInfoButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!customerId) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        Info Cliente
      </Button>

      <CustomerInfoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerId={customerId}
        customerName={customerName}
        customerPhone={customerPhone}
      />
    </>
  );
}
