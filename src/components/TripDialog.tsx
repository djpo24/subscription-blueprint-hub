import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TripDialog({ open, onOpenChange, onSuccess }: TripDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    flight_number: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('trips')
        .insert([{
          trip_date: format(date, 'yyyy-MM-dd'),
          origin: formData.origin,
          destination: formData.destination,
          flight_number: formData.flight_number || null,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast({
        title: "Viaje creado",
        description: "El viaje ha sido creado exitosamente",
      });

      // Reset form
      setFormData({
        origin: '',
        destination: '',
        flight_number: ''
      });
      setDate(undefined);

      onSuccess();
    } catch (error: any) {
      console.error('Error creating trip:', error);
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe un viaje para esta fecha y ruta",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el viaje",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Viaje</DialogTitle>
          <DialogDescription>
            Crea un nuevo viaje para agrupar encomiendas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="trip_date">Fecha del Viaje</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={es}
                  weekStartsOn={0}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origin">Origen</Label>
              <Select 
                value={formData.origin} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                  <SelectItem value="Curazao">Curazao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destination">Destino</Label>
              <Select 
                value={formData.destination} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                  <SelectItem value="Curazao">Curazao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="flight_number">Número de Vuelo (Opcional)</Label>
            <Input
              id="flight_number"
              value={formData.flight_number}
              onChange={(e) => setFormData(prev => ({ ...prev, flight_number: e.target.value }))}
              placeholder="AV123"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Viaje'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
