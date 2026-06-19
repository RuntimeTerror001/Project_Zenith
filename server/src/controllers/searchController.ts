import { Response } from 'express';
import { SearchHistory } from '../models/SearchHistory';
import { AuthRequest } from '../middleware/auth';

export class SearchController {
  static async getSearchHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

      // Limit to last 10 search results
      const history = await SearchHistory.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(10);
        
      return res.json(history.map((h) => ({
        id: h._id.toString(),
        query: h.query,
        createdAt: h.createdAt
      })));
    } catch (error) {
      console.error('Error fetching search history:', error);
      return res.status(500).json({ message: 'Server error retrieving search history.' });
    }
  }

  static async addSearch(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
      const { query } = req.body;

      if (!query || !query.trim()) {
        return res.status(400).json({ message: 'query is required.' });
      }

      const trimmedQuery = query.trim();

      // Avoid immediate adjacent duplicates: check if latest query matches this one
      const latest = await SearchHistory.findOne({ userId: req.userId }).sort({ createdAt: -1 });
      if (latest && latest.query.toLowerCase() === trimmedQuery.toLowerCase()) {
        return res.json({
          id: latest._id.toString(),
          query: latest.query,
          createdAt: latest.createdAt
        });
      }

      const search = new SearchHistory({
        userId: req.userId,
        query: trimmedQuery
      });

      await search.save();
      return res.status(201).json({
        id: search._id.toString(),
        query: search.query,
        createdAt: search.createdAt
      });
    } catch (error) {
      console.error('Error adding search history:', error);
      return res.status(500).json({ message: 'Server error saving search entry.' });
    }
  }

  static async clearSearchHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

      await SearchHistory.deleteMany({ userId: req.userId });
      return res.json({ message: 'Search history cleared successfully.' });
    } catch (error) {
      console.error('Error clearing search history:', error);
      return res.status(500).json({ message: 'Server error deleting search history.' });
    }
  }
}
