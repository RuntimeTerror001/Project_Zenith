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
}
