
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onImageRemove: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, onImageRemove }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {selectedImage ? (
        <div className="relative inline-block">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Imagen seleccionada"
            className="h-20 w-20 object-cover rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={onImageRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            Arrastra una imagen aquí o haz clic para seleccionar
          </p>
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}
