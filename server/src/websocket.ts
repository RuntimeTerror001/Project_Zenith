import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as url from 'url';
import * as jwt from 'jsonwebtoken';
import { SpaceService } from './services/spaceService';
import { Notification } from './models/Notification';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cosmos_key_zenith_12345';

// Keep track of active connections
const clients = new Map<string, WebSocket>(); // userId -> WebSocket
const anonymousClients = new Set<WebSocket>();

export function initWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url || '').pathname;
    
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, request) => {
    const query = url.parse(request.url || '', true).query;
    const token = query.token as string | undefined;

    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
        // If user already connected, close old connection
        if (clients.has(userId)) {
          clients.get(userId)?.close();
        }
        clients.set(userId, ws);
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'WebSocket Auth failed. Invalid token.' }));
      }
    } else {
      anonymousClients.add(ws);
    }

    console.log(`WebSocket Client Connected (Authenticated: ${userId !== null})`);

    // Send immediate welcome
    ws.send(JSON.stringify({ type: 'info', data: { message: 'Connected to Project Zenith Space-Bridge.' } }));

    // Send current ISS position immediately if cached
    SpaceService.getIssPosition().then((pos) => {
      ws.send(JSON.stringify({ type: 'iss', data: pos }));
    }).catch(() => {});

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      } else {
        anonymousClients.delete(ws);
      }
      console.log(`WebSocket Client Disconnected`);
    });

    ws.on('error', (err) => {
      console.error('WebSocket Error:', err);
    });
  });

  // Broadcast ISS telemetry every 5 seconds
  setInterval(async () => {
    try {
      const pos = await SpaceService.getIssPosition();
      const payload = JSON.stringify({ type: 'iss', data: pos });
      
      // Broadcast to all authenticated clients
      clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
      // Broadcast to all anonymous clients
      anonymousClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    } catch (error) {
      // Suppress background errors to prevent crash
    }
  }, 5000);
}

// Function to push a real-time notification to a specific connected user
export async function sendRealTimeNotification(userId: string, message: string, type: string = 'system') {
  try {
    // Save to database first
    const notif = new Notification({
      userId,
      message,
      type
    });
    await notif.save();

    // Push to WebSocket if user is connected
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: {
          id: notif._id.toString(),
          message: notif.message,
          isRead: notif.isRead,
          type: notif.type,
          createdAt: notif.createdAt
        }
      }));
    }
  } catch (error) {
    console.error('Failed to send real-time notification:', error);
  }
}
