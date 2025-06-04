import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface MobileDeliveryFormFieldsProps {
  deliveredBy: string;
  setDeliveredBy: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  hideDeliveredBy?: boolean;
}
export function MobileDeliveryFormFields({
  deliveredBy,
  setDeliveredBy,
  notes,
  setNotes,
  hideDeliveredBy = false
}: MobileDeliveryFormFieldsProps) {
  const [showNotes, setShowNotes] = useState(false);
  return;
}