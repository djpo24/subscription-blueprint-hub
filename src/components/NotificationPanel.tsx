
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notificaciones</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Panel de notificaciones</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
