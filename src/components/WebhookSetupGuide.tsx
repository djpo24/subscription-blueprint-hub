import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Webhook, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
export function WebhookSetupGuide() {
  const {
    toast
  } = useToast();
  const [copied, setCopied] = useState(false);
  const webhookUrl = 'https://bnuahsuehizwwcejqilm.supabase.co/functions/v1/whatsapp-webhook';
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles"
    });
    setTimeout(() => setCopied(false), 2000);
  };
  return;
}