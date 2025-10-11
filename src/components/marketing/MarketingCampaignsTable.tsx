
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, AlertCircle } from 'lucide-react';
import { CampaignFailedMessagesDialog } from './CampaignFailedMessagesDialog';

interface MarketingCampaign {
  id: string;
  campaign_name: string;
  sent_at: string;
  total_messages_sent: number;
  success_count: number;
  failed_count: number;
  trip_start_date: string;
  trip_end_date: string;
}

interface MarketingCampaignsTableProps {
  campaigns: MarketingCampaign[];
  isLoading: boolean;
}

export function MarketingCampaignsTable({ campaigns, isLoading }: MarketingCampaignsTableProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: string; name: string } | null>(null);
  const [isFailedDialogOpen, setIsFailedDialogOpen] = useState(false);

  const handleViewFailedMessages = (campaignId: string, campaignName: string) => {
    setSelectedCampaign({ id: campaignId, name: campaignName });
    setIsFailedDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay campañas de marketing registradas</p>
      </div>
    );
  }

  const getSuccessRate = (campaign: MarketingCampaign) => {
    if (campaign.total_messages_sent === 0) return 0;
    return Math.round((campaign.success_count / campaign.total_messages_sent) * 100);
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaña</TableHead>
          <TableHead>Fecha de envío</TableHead>
          <TableHead>Período de viajes</TableHead>
          <TableHead>Enviados</TableHead>
          <TableHead>Exitosos</TableHead>
          <TableHead>Fallidos</TableHead>
          <TableHead>Tasa de éxito</TableHead>
          <TableHead className="w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
            <TableCell>
              {new Date(campaign.sent_at).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </TableCell>
            <TableCell>
              {new Date(campaign.trip_start_date).toLocaleDateString('es-CO')} - {' '}
              {new Date(campaign.trip_end_date).toLocaleDateString('es-CO')}
            </TableCell>
            <TableCell>{campaign.total_messages_sent}</TableCell>
            <TableCell className="text-green-600 font-medium">
              {campaign.success_count}
            </TableCell>
            <TableCell className="text-red-600 font-medium">
              {campaign.failed_count}
            </TableCell>
            <TableCell>
              <Badge 
                variant={getSuccessRate(campaign) >= 80 ? "default" : 
                        getSuccessRate(campaign) >= 60 ? "secondary" : "destructive"}
              >
                {getSuccessRate(campaign)}%
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                {campaign.failed_count > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewFailedMessages(campaign.id, campaign.campaign_name)}
                    title="Ver mensajes fallidos"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    {selectedCampaign && (
      <CampaignFailedMessagesDialog
        isOpen={isFailedDialogOpen}
        onOpenChange={setIsFailedDialogOpen}
        campaignId={selectedCampaign.id}
        campaignName={selectedCampaign.name}
      />
    )}
  </>
  );
}
