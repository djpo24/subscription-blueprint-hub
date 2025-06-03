
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  onSendMessage: (message: string, image?: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleSend = async () => {
    if (isSending || (!message.trim() && !selectedImage)) return;
    
    console.log('📤 ChatInput: Sending message:', { message: message.substring(0, 50), hasImage: !!selectedImage });
    
    setIsSending(true);
    
    try {
      await onSendMessage(message.trim(), selectedImage || undefined);
      
      // Limpiar formulario solo si el envío fue exitoso
      setMessage('');
      setSelectedImage(null);
      setShowImageUpload(false);
      textareaRef.current?.focus();
      
      console.log('✅ ChatInput: Message sent successfully');
    } catch (error) {
      console.error('❌ ChatInput: Error sending message:', error);
      // No limpiar el formulario si hay error, para que el usuario pueda reintentar
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    console.log('🖼️ Image selected:', file.name);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    console.log('🗑️ Image removed');
  };

  const isSubmitDisabled = disabled || isSending || isLoading || (!message.trim() && !selectedImage);

  return (
    <div className={`border-t border-gray-200 ${isMobile ? 'p-3' : 'p-4'} bg-white`}>
      {/* Preview de imagen seleccionada */}
      {selectedImage && (
        <div className="mb-3 p-2 bg-gray-50 rounded-md flex items-center gap-2">
          <span className="text-sm text-gray-600">📎 {selectedImage.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageRemove}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cargador de imágenes */}
      {showImageUpload && (
        <div className="mb-3">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onImageRemove={handleImageRemove}
          />
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size={isMobile ? "sm" : "sm"}
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="flex-shrink-0"
          disabled={isSending}
        >
          <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
        </Button>
        
        <Textarea
          ref={textareaRef}
          placeholder={isMobile ? "Escribir mensaje..." : "Escribir mensaje... (Enter para enviar)"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`min-h-[40px] max-h-32 resize-none flex-1 ${isMobile ? 'text-sm' : ''}`}
          disabled={disabled || isSending}
        />
        
        <Button
          onClick={handleSend}
          disabled={isSubmitDisabled}
          size={isMobile ? "sm" : "sm"}
          className="flex-shrink-0"
        >
          {isSending ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
          )}
        </Button>
      </div>
      
      {isSending && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Enviando mensaje...
        </div>
      )}
    </div>
  );
}
