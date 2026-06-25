"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceController = void 0;
const spaceService_1 = require("../services/spaceService");
class SpaceController {
    static async getIss(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getIssPosition();
            res.setHeader('Cache-Control', 'public, max-age=3, stale-while-revalidate=5');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Live ISS data is temporarily unavailable.' });
        }
    }
    static async getApod(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getApod();
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'NASA picture data is temporarily unavailable.' });
        }
    }
    static async getNews(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getSpaceNews();
            res.setHeader('Cache-Control', 'public, max-age=1800');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Space news is temporarily unavailable.' });
        }
    }
    static async getEvents(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getLiveEvents();
            res.setHeader('Cache-Control', 'public, max-age=900');
            return res.json(data);
        }
        catch (error) {
            // getLiveEvents handles its own fail-safe fallbacks internally
            return res.json(error);
        }
    }
    static async getSatellites(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getSatellites();
            res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Live satellite catalog is temporarily unavailable.' });
        }
    }
    static async getConstellations(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getConstellations();
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Constellations data is temporarily unavailable.' });
        }
    }
    static async getStars(req, res) {
        try {
            const getNamesOnly = req.query.names === 'true';
            const binary = spaceService_1.SpaceService.getCompiledStarsBinary();
            const names = spaceService_1.SpaceService.getCompiledStarsNames();
            if (!binary || !names) {
                // Trigger background compile
                void spaceService_1.SpaceService.compileStarsDatabase();
                return res.status(202).json({ message: 'Star catalog is compile-loading in background' });
            }
            if (getNamesOnly) {
                return res.json(names);
            }
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
            return res.send(binary);
        }
        catch (error) {
            console.error('Failed to serve stars catalog:', error);
            return res.status(503).json({ message: 'Stars catalog is temporarily unavailable.' });
        }
    }
    static async getConstellationsBoundaries(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getConstellationsBoundaries();
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Constellation boundaries are temporarily unavailable.' });
        }
    }
    static async getTimeline(req, res) {
        try {
            const data = await spaceService_1.SpaceService.getTimelineEvents();
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Timeline events are temporarily unavailable.' });
        }
    }
    static async getStats(req, res) {
        try {
            const lat = parseFloat(req.query.latitude) || 0;
            const lng = parseFloat(req.query.longitude) || 0;
            const dateStr = req.query.date || new Date().toISOString();
            const data = await spaceService_1.SpaceService.getAstronomyStats(lat, lng, dateStr);
            res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=60');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Astronomy stats are temporarily unavailable.' });
        }
    }
    static async getPlanets(req, res) {
        try {
            const lat = parseFloat(req.query.latitude) || 0;
            const lng = parseFloat(req.query.longitude) || 0;
            const dateStr = req.query.date || new Date().toISOString();
            const data = await spaceService_1.SpaceService.getPlanetsData(lat, lng, dateStr);
            res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=300');
            return res.json(data);
        }
        catch (error) {
            return res.status(503).json({ message: 'Planets data is temporarily unavailable.' });
        }
    }
}
exports.SpaceController = SpaceController;
