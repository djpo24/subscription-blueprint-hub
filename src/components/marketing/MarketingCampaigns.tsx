
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketingCampaigns } from '@/hooks/useMarketingCampaigns';
import { useSendMarketingCampaign } from '@/hooks/useSendMarketingCampaign';
import { useToast } from '@/hooks/use-toast';
import { Send, Plus, Calendar } from 'lucide-react';
import { MarketingCampaignsTable } from './MarketingCampaignsTable';

export function MarketingCampaigns() {
  const { data: campaigns = [], isLoading } = useMarketingCampaigns();
  const { mutateAsync: sendCampaign, isPending: isSending } = useSendMarketingCampaign();
  const { toast } = useToast();

  const handleSendCampaign = async () => {
    try {
      const result = await sendCampaign();
      toast({
        title: "Campaña enviada",
        description: `Se han enviado ${result.totalSent} mensajes exitosamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error al enviar campaña",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campañas de Marketing</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handleSendCampaign}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar campaña ahora'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MarketingCampaignsTable campaigns={campaigns} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
