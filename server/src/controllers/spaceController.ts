import { Request, Response } from 'express';
import { SpaceService } from '../services/spaceService';

export class SpaceController {
  static async getIss(req: Request, res: Response) {
    try {
      const data = await SpaceService.getIssPosition();
      res.setHeader('Cache-Control', 'public, max-age=3, stale-while-revalidate=5');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Live ISS data is temporarily unavailable.' });
    }
  }

  static async getApod(req: Request, res: Response) {
    try {
      const data = await SpaceService.getApod();
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'NASA picture data is temporarily unavailable.' });
    }
  }

  static async getNews(req: Request, res: Response) {
    try {
      const data = await SpaceService.getSpaceNews();
      res.setHeader('Cache-Control', 'public, max-age=1800');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Space news is temporarily unavailable.' });
    }
  }

  static async getEvents(req: Request, res: Response) {
    try {
      const data = await SpaceService.getLiveEvents();
      res.setHeader('Cache-Control', 'public, max-age=900');
      return res.json(data);
    } catch (error) {
      // getLiveEvents handles its own fail-safe fallbacks internally
      return res.json(error);
    }
  }

  static async getSatellites(req: Request, res: Response) {
    try {
      const data = await SpaceService.getSatellites();
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=3600');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Live satellite catalog is temporarily unavailable.' });
    }
  }

  static async getConstellations(req: Request, res: Response) {
    try {
      const data = await SpaceService.getConstellations();
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Constellations data is temporarily unavailable.' });
    }
  }

  static async getStars(req: Request, res: Response) {
    try {
      const getNamesOnly = req.query.names === 'true';
      
      const binary = SpaceService.getCompiledStarsBinary();
      const names = SpaceService.getCompiledStarsNames();

      if (!binary || !names) {
        // Trigger background compile
        void SpaceService.compileStarsDatabase();
        return res.status(202).json({ message: 'Star catalog is compile-loading in background' });
      }

      if (getNamesOnly) {
        return res.json(names);
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      return res.send(binary);
    } catch (error) {
      console.error('Failed to serve stars catalog:', error);
      return res.status(503).json({ message: 'Stars catalog is temporarily unavailable.' });
    }
  }

  static async getConstellationsBoundaries(req: Request, res: Response) {
    try {
      const data = await SpaceService.getConstellationsBoundaries();
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Constellation boundaries are temporarily unavailable.' });
    }
  }

  static async getTimeline(req: Request, res: Response) {
    try {
      const data = await SpaceService.getTimelineEvents();
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Timeline events are temporarily unavailable.' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 0;
      const lng = parseFloat(req.query.longitude as string) || 0;
      const dateStr = (req.query.date as string) || new Date().toISOString();
      const data = await SpaceService.getAstronomyStats(lat, lng, dateStr);
      res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=60');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Astronomy stats are temporarily unavailable.' });
    }
  }

  static async getPlanets(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.latitude as string) || 0;
      const lng = parseFloat(req.query.longitude as string) || 0;
      const dateStr = (req.query.date as string) || new Date().toISOString();
      const data = await SpaceService.getPlanetsData(lat, lng, dateStr);
      res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=300');
      return res.json(data);
    } catch (error) {
      return res.status(503).json({ message: 'Planets data is temporarily unavailable.' });
    }
  }
}
