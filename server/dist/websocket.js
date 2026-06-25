"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.sendRealTimeNotification = sendRealTimeNotification;
const ws_1 = require("ws");
const url = __importStar(require("url"));
const jwt = __importStar(require("jsonwebtoken"));
const spaceService_1 = require("./services/spaceService");
const Notification_1 = require("./models/Notification");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cosmos_key_zenith_12345';
// Keep track of active connections
const clients = new Map(); // userId -> WebSocket
const anonymousClients = new Set();
function initWebSocketServer(server) {
    const wss = new ws_1.WebSocketServer({ noServer: true });
    server.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url || '').pathname;
        if (pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
        else {
            socket.destroy();
        }
    });
    wss.on('connection', (ws, request) => {
        const query = url.parse(request.url || '', true).query;
        const token = query.token;
        let userId = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
                // If user already connected, close old connection
                if (clients.has(userId)) {
                    clients.get(userId)?.close();
                }
                clients.set(userId, ws);
            }
            catch (error) {
                ws.send(JSON.stringify({ type: 'error', message: 'WebSocket Auth failed. Invalid token.' }));
            }
        }
        else {
            anonymousClients.add(ws);
        }
        console.log(`WebSocket Client Connected (Authenticated: ${userId !== null})`);
        // Send immediate welcome
        ws.send(JSON.stringify({ type: 'info', data: { message: 'Connected to Project Zenith Space-Bridge.' } }));
        // Send current ISS position immediately if cached
        spaceService_1.SpaceService.getIssPosition().then((pos) => {
            ws.send(JSON.stringify({ type: 'iss', data: pos }));
        }).catch(() => { });
        ws.on('close', () => {
            if (userId) {
                clients.delete(userId);
            }
            else {
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
            const pos = await spaceService_1.SpaceService.getIssPosition();
            const payload = JSON.stringify({ type: 'iss', data: pos });
            // Broadcast to all authenticated clients
            clients.forEach((ws) => {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.send(payload);
                }
            });
            // Broadcast to all anonymous clients
            anonymousClients.forEach((ws) => {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.send(payload);
                }
            });
        }
        catch (error) {
            // Suppress background errors to prevent crash
        }
    }, 5000);
}
// Function to push a real-time notification to a specific connected user
async function sendRealTimeNotification(userId, message, type = 'system') {
    try {
        // Save to database first
        const notif = new Notification_1.Notification({
            userId,
            message,
            type
        });
        await notif.save();
        // Push to WebSocket if user is connected
        const ws = clients.get(userId);
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
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
    }
    catch (error) {
        console.error('Failed to send real-time notification:', error);
    }
}
