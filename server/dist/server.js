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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const dotenv = __importStar(require("dotenv"));
const db_1 = require("./config/db");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = require("./middleware/auth");
const authController_1 = require("./controllers/authController");
const favoritesController_1 = require("./controllers/favoritesController");
const searchController_1 = require("./controllers/searchController");
const notificationController_1 = require("./controllers/notificationController");
const spaceController_1 = require("./controllers/spaceController");
const settingsController_1 = require("./controllers/settingsController");
const websocket_1 = require("./websocket");
const spaceService_1 = require("./services/spaceService");
// Initialize env configurations
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5001;
// Setup Middlewares
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.CLIENT_URL].filter(Boolean),
    credentials: true
}));
app.use(express_1.default.json());
// Global API rate limit
app.use('/api', rateLimiter_1.apiLimiter);
// Space & Telemetry Routes (Public, Cached)
app.get('/api/iss', spaceController_1.SpaceController.getIss);
app.get('/api/apod', spaceController_1.SpaceController.getApod);
app.get('/api/news', spaceController_1.SpaceController.getNews);
app.get('/api/events', spaceController_1.SpaceController.getEvents);
app.get('/api/satellites', spaceController_1.SpaceController.getSatellites);
app.get('/api/constellations', spaceController_1.SpaceController.getConstellations);
app.get('/api/constellations/boundaries', spaceController_1.SpaceController.getConstellationsBoundaries);
app.get('/api/stars', spaceController_1.SpaceController.getStars);
app.get('/api/timeline', spaceController_1.SpaceController.getTimeline);
app.get('/api/stats', spaceController_1.SpaceController.getStats);
app.get('/api/planets', spaceController_1.SpaceController.getPlanets);
// User Settings Routes
app.get('/api/settings', auth_1.requireAuth, settingsController_1.SettingsController.getSettings);
app.patch('/api/settings', auth_1.requireAuth, settingsController_1.SettingsController.updateSettings);
// Authentication Routes
app.post('/api/auth/register', rateLimiter_1.authLimiter, authController_1.AuthController.register);
app.post('/api/auth/login', rateLimiter_1.authLimiter, authController_1.AuthController.login);
app.get('/api/auth/me', auth_1.requireAuth, authController_1.AuthController.getMe);
app.patch('/api/auth/profile', auth_1.requireAuth, authController_1.AuthController.updateProfile);
// Favorites Routes
app.get('/api/favorites', auth_1.requireAuth, favoritesController_1.FavoritesController.getFavorites);
app.post('/api/favorites', auth_1.requireAuth, favoritesController_1.FavoritesController.addFavorite);
app.delete('/api/favorites/:objectId', auth_1.requireAuth, favoritesController_1.FavoritesController.removeFavorite);
// Search History Routes
app.get('/api/search/history', auth_1.requireAuth, searchController_1.SearchController.getSearchHistory);
app.post('/api/search/history', auth_1.requireAuth, searchController_1.SearchController.addSearch);
app.delete('/api/search/history', auth_1.requireAuth, searchController_1.SearchController.clearSearchHistory);
// Notifications Routes
app.get('/api/notifications', auth_1.requireAuth, notificationController_1.NotificationController.getNotifications);
app.patch('/api/notifications/:id', auth_1.requireAuth, notificationController_1.NotificationController.markAsRead);
app.delete('/api/notifications', auth_1.requireAuth, notificationController_1.NotificationController.clearAllNotifications);
// Create HTTP Server
const server = (0, http_1.createServer)(app);
// Initialize WebSockets
(0, websocket_1.initWebSocketServer)(server);
// Start Server
async function start() {
    await (0, db_1.connectDB)();
    // Pre-load and compile star catalog in background
    void spaceService_1.SpaceService.compileStarsDatabase();
    server.listen(port, () => {
        console.log(`Project Zenith Server listening on port ${port}`);
    });
}
void start();
