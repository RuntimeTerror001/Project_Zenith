import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import * as dotenv from 'dotenv';
import { connectDB } from './config/db';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { requireAuth } from './middleware/auth';
import { AuthController } from './controllers/authController';
import { FavoritesController } from './controllers/favoritesController';
import { SearchController } from './controllers/searchController';
import { NotificationController } from './controllers/notificationController';
import { SpaceController } from './controllers/spaceController';
import { SettingsController } from './controllers/settingsController';
import { initWebSocketServer } from './websocket';
import { SpaceService } from './services/spaceService';

// Initialize env configurations
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Setup Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.CLIENT_URL].filter(Boolean) as string[],
  credentials: true
}));
app.use(express.json());

// Global API rate limit
app.use('/api', apiLimiter);

// Space & Telemetry Routes (Public, Cached)
app.get('/api/iss', SpaceController.getIss);
app.get('/api/apod', SpaceController.getApod);
app.get('/api/news', SpaceController.getNews);
app.get('/api/events', SpaceController.getEvents);
app.get('/api/satellites', SpaceController.getSatellites);
app.get('/api/constellations', SpaceController.getConstellations);
app.get('/api/constellations/boundaries', SpaceController.getConstellationsBoundaries);
app.get('/api/stars', SpaceController.getStars);
app.get('/api/timeline', SpaceController.getTimeline);
app.get('/api/stats', SpaceController.getStats);
app.get('/api/planets', SpaceController.getPlanets);

// User Settings Routes
app.get('/api/settings', requireAuth, SettingsController.getSettings);
app.patch('/api/settings', requireAuth, SettingsController.updateSettings);

// Authentication Routes
app.post('/api/auth/register', authLimiter, AuthController.register);
app.post('/api/auth/login', authLimiter, AuthController.login);
app.get('/api/auth/me', requireAuth, AuthController.getMe);
app.patch('/api/auth/profile', requireAuth, AuthController.updateProfile);

// Favorites Routes
app.get('/api/favorites', requireAuth, FavoritesController.getFavorites);
app.post('/api/favorites', requireAuth, FavoritesController.addFavorite);
app.delete('/api/favorites/:objectId', requireAuth, FavoritesController.removeFavorite);

// Search History Routes
app.get('/api/search/history', requireAuth, SearchController.getSearchHistory);
app.post('/api/search/history', requireAuth, SearchController.addSearch);
app.delete('/api/search/history', requireAuth, SearchController.clearSearchHistory);

// Notifications Routes
app.get('/api/notifications', requireAuth, NotificationController.getNotifications);
app.patch('/api/notifications/:id', requireAuth, NotificationController.markAsRead);
app.delete('/api/notifications', requireAuth, NotificationController.clearAllNotifications);

// Create HTTP Server
const server = createServer(app);

// Initialize WebSockets
initWebSocketServer(server);

// Start Server
async function start() {
  await connectDB();
  
  // Pre-load and compile star catalog in background
  void SpaceService.compileStarsDatabase();

  server.listen(port, () => {
    console.log(`Project Zenith Server listening on port ${port}`);
  });
}

void start();
