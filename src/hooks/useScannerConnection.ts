import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ScannerMessage {
  type: 'scan' | 'mobile_connected' | 'mobile_disconnected' | 'ping';
  data?: string;
  from?: string;
  timestamp?: string;
}

export function useScannerConnection(sessionId: string, clientType: 'desktop' | 'mobile') {
  const [isConnected, setIsConnected] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = `wss://tkwffswlgpzxyyuhdrrp.supabase.co/functions/v1/scanner-relay?sessionId=${sessionId}&type=${clientType}`;
    
    console.log(`[Scanner] Connecting as ${clientType} to session ${sessionId}`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[Scanner] Connected as ${clientType}`);
      setIsConnected(true);
      if (clientType === 'desktop') {
        toast.success('Listo para escanear', {
          description: 'Conecta tu celular para comenzar'
        });
      } else {
        toast.success('Escáner conectado', {
          description: 'Ahora puedes escanear códigos de barras'
        });
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: ScannerMessage = JSON.parse(event.data);
        console.log('[Scanner] Message received:', message);

        if (message.type === 'scan' && message.data) {
          setLastScan(message.data);
        } else if (message.type === 'mobile_connected') {
          toast.success('Celular conectado', {
            description: 'Ahora puedes escanear códigos'
          });
        } else if (message.type === 'mobile_disconnected') {
          toast.warning('Celular desconectado');
        }
      } catch (error) {
        console.error('[Scanner] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[Scanner] WebSocket error:', error);
      toast.error('Error de conexión');
    };

    ws.onclose = () => {
      console.log('[Scanner] Disconnected');
      setIsConnected(false);
      wsRef.current = null;

      if (shouldConnect) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('[Scanner] Attempting to reconnect...');
          connect();
        }, 3000);
      }
    };
  }, [sessionId, clientType, shouldConnect]);

  const disconnect = useCallback(() => {
    setShouldConnect(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendScan = useCallback((barcode: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'scan',
        data: barcode
      }));
      console.log('[Scanner] Sent scan:', barcode);
    }
  }, []);

  useEffect(() => {
    if (shouldConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [shouldConnect, connect, disconnect]);

  const startConnection = useCallback(() => {
    setShouldConnect(true);
  }, []);

  const stopConnection = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    isConnected,
    lastScan,
    sendScan,
    startConnection,
    stopConnection
  };
}
