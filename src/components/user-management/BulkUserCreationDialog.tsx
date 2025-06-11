
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

interface BulkUserCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CUSTOMERS_TO_CREATE = [
  'TATIANA MONTALVO',
  'ADELBERT CIJNTJO',
  'DOMINGO CURACAO',
  'GISELLE VILLALOBOS',
  'DANIELA MOLINA',
  'JUDITH PEÑA',
  'CARLOS AVILES',
  'MERLYN ARIZA',
  'MADELEIN ALGARIN',
  'MIRTHA NAVARRO',
  'SILVIA IROUQUIN',
  'DANIELA HERNANDEZ',
  'MONICA HINCAPIE',
  'CAROL ORTEGA',
  'KIMBERLY MADURO',
  'VIJAY KODWANI',
  'FREDDY MEJIA',
  'MARIETH CASTAÑEDA',
  'EDITH CABARCAS',
  'JOSE GOMEZ',
  'LUZ MARINA VIVEROS',
  'DEIMYS MEDINA',
  'ANTONY DE LA ASUNCION NAVARRO',
  'GENESIS LOPEZ',
  'KAREN PEÑA',
  'BUENAVENTURA OROZCO',
  'SUNEY CEPEDA',
  'KELLY FERREIRA',
  'ZADITH BOLAÑO',
  'NIDIS HERNANDEZ',
  'ANGELA BASILIA',
  'TATIANA GOMEZ',
  'EMILIA SILETH',
  'ZULEYMA POLO',
  'ELIANA OSMAN',
  'GUILLERMINA CARDENAS',
  'WENDY MEDINA',
  'GISELLE FRUTO',
  'RUBEN DARIO',
  'CHIKY DOMINICANA',
  'ALIX TRESPALACIO',
  'MARILYN PINTO',
  'CHEIRY CONRRADO',
  'YURLEYDIS DE LA CRUZ',
  'HENRY AVILA',
  'NATALIA MORENO',
  'DORIS ROJAS',
  'CINDY AYALA',
  'LADY HERRERA',
  'DORALYZ CARDOZO',
  'MARIA ALEJANDRA DE LA CRUZ',
  'GABY LUGO',
  'ANA MELENDEZ',
  'LICY CURACAO'
];

export function BulkUserCreationDialog({ open, onOpenChange, onSuccess }: BulkUserCreationDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCustomers, setCreatedCustomers] = useState<string[]>([]);
  const [failedCustomers, setFailedCustomers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generatePhoneNumber = (index: number): string => {
    // Generate 10-digit phone number starting from 0000000001
    return (index + 1).toString().padStart(10, '0');
  };

  const generateEmailFromName = (name: string, index: number): string => {
    // Convert name to lowercase, replace spaces with dots, and add index
    const cleanName = name.toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    return `${cleanName}.${index + 1}@temp.com`;
  };

  const createSingleCustomer = async (fullName: string, index: number) => {
    const phoneNumber = generatePhoneNumber(index);
    const email = generateEmailFromName(fullName, index);
    const fullPhone = `+599${phoneNumber}`;
    
    const customerData = {
      name: fullName,
      email,
      phone: fullPhone,
      whatsapp_number: fullPhone,
      address: 'Dirección pendiente',
      id_number: `ID${(index + 1).toString().padStart(6, '0')}`
    };

    console.log(`Creating customer: ${fullName} with data:`, customerData);

    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    return data;
  };

  const handleBulkCreation = async () => {
    setIsCreating(true);
    setCurrentIndex(0);
    setCreatedCustomers([]);
    setFailedCustomers([]);

    for (let i = 0; i < CUSTOMERS_TO_CREATE.length; i++) {
      const customerName = CUSTOMERS_TO_CREATE[i];
      setCurrentIndex(i + 1);
      
      try {
        await createSingleCustomer(customerName, i);
        setCreatedCustomers(prev => [...prev, customerName]);
        console.log(`✅ Cliente creado: ${customerName}`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error creando cliente ${customerName}:`, error);
        setFailedCustomers(prev => [...prev, customerName]);
      }
    }

    setIsCreating(false);
    
    // Invalidate queries to refresh any customer lists
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    
    toast({
      title: "Creación masiva completada",
      description: `${createdCustomers.length + 1} clientes creados exitosamente, ${failedCustomers.length} fallaron`,
    });

    onSuccess();
  };

  const progress = CUSTOMERS_TO_CREATE.length > 0 ? (currentIndex / CUSTOMERS_TO_CREATE.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Creación Masiva de Clientes</DialogTitle>
          <DialogDescription>
            Se crearán {CUSTOMERS_TO_CREATE.length} clientes con código de país +599 (Curaçao) 
            y números de teléfono de 10 dígitos secuenciales.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isCreating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creando clientes...</span>
                <span>{currentIndex} / {CUSTOMERS_TO_CREATE.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentIndex > 0 && (
                <p className="text-sm text-muted-foreground">
                  Procesando: {CUSTOMERS_TO_CREATE[currentIndex - 1]}
                </p>
              )}
            </div>
          )}

          {!isCreating && (createdCustomers.length > 0 || failedCustomers.length > 0) && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Resultados:</div>
              <div className="text-sm text-green-600">
                ✅ Clientes creados: {createdCustomers.length}
              </div>
              {failedCustomers.length > 0 && (
                <div className="text-sm text-red-600">
                  ❌ Clientes fallidos: {failedCustomers.length}
                  <div className="mt-1 text-xs">
                    {failedCustomers.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="max-h-40 overflow-y-auto border rounded p-2">
            <div className="text-sm font-medium mb-2">Lista de clientes a crear:</div>
            <div className="text-xs space-y-1">
              {CUSTOMERS_TO_CREATE.map((name, index) => (
                <div key={index} className="flex justify-between">
                  <span>{name}</span>
                  <span className="text-muted-foreground">
                    +599 {generatePhoneNumber(index)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {isCreating ? 'Procesando...' : 'Cerrar'}
          </Button>
          {!isCreating && (
            <Button 
              type="button" 
              onClick={handleBulkCreation}
              disabled={isCreating}
            >
              Crear Todos los Clientes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
