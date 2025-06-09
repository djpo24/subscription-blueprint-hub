
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
  placeholder?: string;
}

export function ChatInput({ onSendMessage, isLoading, disabled, placeholder }: ChatInputProps) {
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
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
          <span className="text-sm text-gray-700 font-medium">📎 {selectedImage.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageRemove}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cargador de imágenes */}
      {showImageUpload && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onImageRemove={handleImageRemove}
          />
        </div>
      )}
      
      <div className="flex items-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size={isMobile ? "sm" : "default"}
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="flex-shrink-0 uber-button-secondary"
          disabled={isSending}
        >
          <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </Button>
        
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || (isMobile ? "Escribir mensaje..." : "Escribir mensaje... (Enter para enviar)")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`min-h-[48px] max-h-32 resize-none flex-1 uber-input ${isMobile ? 'text-sm' : ''}`}
          disabled={disabled || isSending}
        />
        
        <Button
          onClick={handleSend}
          disabled={isSubmitDisabled}
          size={isMobile ? "sm" : "default"}
          className="flex-shrink-0 uber-button-primary"
        >
          {isSending ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </Button>
      </div>
      
      {isSending && (
        <div className="mt-3 text-sm text-gray-600 text-center font-medium">
          Enviando mensaje...
        </div>
      )}
    </div>
  );
}
