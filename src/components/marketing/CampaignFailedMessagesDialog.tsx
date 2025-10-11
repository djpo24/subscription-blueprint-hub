import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCampaignFailedMessages } from '@/hooks/useCampaignFailedMessages';
import { useRetryFailedMessages } from '@/hooks/useRetryFailedMessages';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface CampaignFailedMessagesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  campaignName: string;
}

export function CampaignFailedMessagesDialog({
  isOpen,
  onOpenChange,
  campaignId,
  campaignName,
}: CampaignFailedMessagesDialogProps) {
  const { data: failedMessages = [], isLoading } = useCampaignFailedMessages(campaignId);
  const { mutate: retryMessages, isPending: isRetrying } = useRetryFailedMessages();
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(failedMessages.map(m => m.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages([...selectedMessages, messageId]);
    } else {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    }
  };

  const handleRetry = () => {
    if (!campaignId || selectedMessages.length === 0) return;

    retryMessages(
      { campaignId, messageIds: selectedMessages },
      {
        onSuccess: () => {
          setSelectedMessages([]);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mensajes Fallidos - {campaignName}</DialogTitle>
          <DialogDescription>
            Selecciona los mensajes que deseas reintentar enviar
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : failedMessages.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No hay mensajes fallidos en esta campaña</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedMessages.length === failedMessages.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {selectedMessages.length} de {failedMessages.length} seleccionados
                </span>
              </div>
              <Button
                onClick={handleRetry}
                disabled={selectedMessages.length === 0 || isRetrying}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Reenviando...' : 'Reintentar Seleccionados'}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={(checked) => 
                          handleSelectMessage(message.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {message.customer_name || 'N/A'}
                    </TableCell>
                    <TableCell>{message.customer_phone}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600 truncate" title={message.error_message || ''}>
                          {message.error_message || 'Error desconocido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(message.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
