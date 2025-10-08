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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`[Scanner] Already connected as ${clientType}`);
      return;
    }

    const wsUrl = `wss://tkwffswlgpzxyyuhdrrp.supabase.co/functions/v1/scanner-relay?sessionId=${sessionId}&type=${clientType}`;
    
    console.log(`[Scanner] Connecting as ${clientType} to session ${sessionId}`);
    console.log(`[Scanner] WebSocket URL: ${wsUrl}`);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[Scanner] ✅ Connected successfully as ${clientType}`);
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
        console.error('[Scanner] ❌ WebSocket error:', error);
        toast.error('Error de conexión', {
          description: 'No se pudo conectar al servidor de escaneo'
        });
      };

      ws.onclose = (event) => {
        console.log(`[Scanner] Disconnected - Code: ${event.code}, Reason: ${event.reason}`);
        setIsConnected(false);
        wsRef.current = null;

        if (shouldConnect && event.code !== 1000) {
          console.log('[Scanner] Connection closed unexpectedly, attempting reconnect...');
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('[Scanner] Reconnecting...');
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('[Scanner] ❌ Error creating WebSocket:', error);
      toast.error('Error al crear conexión');
      setIsConnected(false);
    }
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
