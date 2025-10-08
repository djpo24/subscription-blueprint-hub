import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConnectedClient {
  socket: WebSocket;
  type: 'desktop' | 'mobile';
  sessionId: string;
}

const sessions = new Map<string, ConnectedClient[]>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');
  const clientType = url.searchParams.get('type') as 'desktop' | 'mobile';

  if (!sessionId || !clientType) {
    return new Response('Missing sessionId or type parameter', { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log(`[Scanner Relay] ${clientType} connected to session ${sessionId}`);
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    
    const sessionClients = sessions.get(sessionId)!;
    sessionClients.push({ socket, type: clientType, sessionId });

    // Notify desktop if mobile connects
    if (clientType === 'mobile') {
      const desktopClient = sessionClients.find(c => c.type === 'desktop');
      if (desktopClient) {
        desktopClient.socket.send(JSON.stringify({
          type: 'mobile_connected',
          timestamp: new Date().toISOString()
        }));
      }
    }

    // Notify mobile if desktop is already connected
    if (clientType === 'desktop') {
      const mobileClient = sessionClients.find(c => c.type === 'mobile');
      if (mobileClient) {
        socket.send(JSON.stringify({
          type: 'mobile_connected',
          timestamp: new Date().toISOString()
        }));
      }
    }
  };

  socket.onmessage = (event) => {
    console.log(`[Scanner Relay] Message from ${clientType}:`, event.data);
    
    try {
      const message = JSON.parse(event.data);
      const sessionClients = sessions.get(sessionId);
      
      if (!sessionClients) return;

      // Relay message to the other client type
      const targetType = clientType === 'mobile' ? 'desktop' : 'mobile';
      const targetClient = sessionClients.find(c => c.type === targetType);
      
      if (targetClient && targetClient.socket.readyState === WebSocket.OPEN) {
        targetClient.socket.send(JSON.stringify({
          ...message,
          from: clientType,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('[Scanner Relay] Error parsing message:', error);
    }
  };

  socket.onclose = () => {
    console.log(`[Scanner Relay] ${clientType} disconnected from session ${sessionId}`);
    
    const sessionClients = sessions.get(sessionId);
    if (sessionClients) {
      const index = sessionClients.findIndex(c => c.socket === socket);
      if (index !== -1) {
        sessionClients.splice(index, 1);
      }

      // Notify other client about disconnection
      const otherClient = sessionClients.find(c => c.type !== clientType);
      if (otherClient && otherClient.socket.readyState === WebSocket.OPEN) {
        otherClient.socket.send(JSON.stringify({
          type: clientType === 'mobile' ? 'mobile_disconnected' : 'desktop_disconnected',
          timestamp: new Date().toISOString()
        }));
      }

      if (sessionClients.length === 0) {
        sessions.delete(sessionId);
      }
    }
  };

  return response;
});
