import { Response } from 'express';
import { Favorite } from '../models/Favorite';
import { AuthRequest } from '../middleware/auth';

export class FavoritesController {
  static async getFavorites(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

      const list = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json(list.map((fav) => ({
        id: fav._id.toString(),
        objectId: fav.objectId,
        objectType: fav.objectType,
        createdAt: fav.createdAt
      })));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return res.status(500).json({ message: 'Server error retrieving favorites.' });
    }
  }

  static async addFavorite(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
      const { objectId, objectType } = req.body;

      if (!objectId || !objectType) {
        return res.status(400).json({ message: 'objectId and objectType are required.' });
      }

      // Check if already in favorites to prevent uniqueness constraint violation error
      const existing = await Favorite.findOne({ userId: req.userId, objectId, objectType });
      if (existing) {
        return res.json({
          id: existing._id.toString(),
          objectId: existing.objectId,
          objectType: existing.objectType,
          createdAt: existing.createdAt
        });
      }

      const fav = new Favorite({
        userId: req.userId,
        objectId,
        objectType
      });

      await fav.save();
      return res.status(201).json({
        id: fav._id.toString(),
        objectId: fav.objectId,
        objectType: fav.objectType,
        createdAt: fav.createdAt
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      return res.status(500).json({ message: 'Server error saving favorite.' });
    }
  }

  static async removeFavorite(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
      const { objectId } = req.params;

      if (!objectId) {
        return res.status(400).json({ message: 'objectId is required in route params.' });
      }

      // Can delete either by the favorite's db ID or by the objectId string
      const result = await Favorite.deleteOne({ 
        userId: req.userId, 
        $or: [
          { objectId: objectId },
          { _id: objectId.match(/^[0-9a-fA-F]{24}$/) ? objectId : undefined }
        ].filter(Boolean) as any
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Favorite not found.' });
      }

      return res.json({ message: 'Favorite removed successfully.', objectId });
    } catch (error) {
      console.error('Error removing favorite:', error);
      return res.status(500).json({ message: 'Server error deleting favorite.' });
    }
  }
}
