
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

const USERS_TO_CREATE = [
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
  const [createdUsers, setCreatedUsers] = useState<string[]>([]);
  const [failedUsers, setFailedUsers] = useState<string[]>([]);
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

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: 'Usuario' };
    }
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  const createSingleUser = async (fullName: string, index: number) => {
    const { firstName, lastName } = splitName(fullName);
    const phoneNumber = generatePhoneNumber(index);
    const email = generateEmailFromName(fullName, index);
    
    const userData = {
      email,
      password: 'temp123456', // Temporary password
      first_name: firstName,
      last_name: lastName,
      countryCode: '+599',
      phoneNumber,
      role: 'employee' as const
    };

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No active session');
    }

    // Prepare user data with full phone number
    const fullPhone = `${userData.countryCode}${userData.phoneNumber}`;
    const userDataToSend = {
      ...userData,
      phone: fullPhone
    };

    // Call the Edge Function to create user
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userDataToSend,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  };

  const handleBulkCreation = async () => {
    setIsCreating(true);
    setCurrentIndex(0);
    setCreatedUsers([]);
    setFailedUsers([]);

    for (let i = 0; i < USERS_TO_CREATE.length; i++) {
      const userName = USERS_TO_CREATE[i];
      setCurrentIndex(i + 1);
      
      try {
        await createSingleUser(userName, i);
        setCreatedUsers(prev => [...prev, userName]);
        console.log(`✅ Usuario creado: ${userName}`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error creando usuario ${userName}:`, error);
        setFailedUsers(prev => [...prev, userName]);
      }
    }

    setIsCreating(false);
    
    // Invalidate queries to refresh the user list
    queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
    
    toast({
      title: "Creación masiva completada",
      description: `${createdUsers.length + 1} usuarios creados exitosamente, ${failedUsers.length} fallaron`,
    });

    onSuccess();
  };

  const progress = USERS_TO_CREATE.length > 0 ? (currentIndex / USERS_TO_CREATE.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Creación Masiva de Usuarios</DialogTitle>
          <DialogDescription>
            Se crearán {USERS_TO_CREATE.length} usuarios con código de país +599 (Curaçao) 
            y números de teléfono de 10 dígitos secuenciales.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isCreating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creando usuarios...</span>
                <span>{currentIndex} / {USERS_TO_CREATE.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentIndex > 0 && (
                <p className="text-sm text-muted-foreground">
                  Procesando: {USERS_TO_CREATE[currentIndex - 1]}
                </p>
              )}
            </div>
          )}

          {!isCreating && (createdUsers.length > 0 || failedUsers.length > 0) && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Resultados:</div>
              <div className="text-sm text-green-600">
                ✅ Usuarios creados: {createdUsers.length}
              </div>
              {failedUsers.length > 0 && (
                <div className="text-sm text-red-600">
                  ❌ Usuarios fallidos: {failedUsers.length}
                  <div className="mt-1 text-xs">
                    {failedUsers.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="max-h-40 overflow-y-auto border rounded p-2">
            <div className="text-sm font-medium mb-2">Lista de usuarios a crear:</div>
            <div className="text-xs space-y-1">
              {USERS_TO_CREATE.map((name, index) => (
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
              Crear Todos los Usuarios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
