
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleSend = () => {
    if (!message.trim() && !selectedImage) return;
    
    onSendMessage(message.trim(), selectedImage || undefined);
    setMessage('');
    setSelectedImage(null);
    setShowImageUpload(false);
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  return (
    <div className={`border-t border-gray-200 ${isMobile ? 'p-3' : 'p-4'} bg-white`}>
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
        >
          <Paperclip className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
        </Button>
        
        <Textarea
          ref={textareaRef}
          placeholder={isMobile ? "Mensaje..." : "Escribir mensaje... (Enter para enviar)"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`min-h-[40px] max-h-32 resize-none flex-1 ${isMobile ? 'text-sm' : ''}`}
          disabled={disabled}
        />
        
        <Button
          onClick={handleSend}
          disabled={isLoading || disabled || (!message.trim() && !selectedImage)}
          size={isMobile ? "sm" : "sm"}
          className="flex-shrink-0"
        >
          <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
        </Button>
      </div>
    </div>
  );
}
