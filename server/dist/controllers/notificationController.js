"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const Notification_1 = require("../models/Notification");
class NotificationController {
    static async getNotifications(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const list = await Notification_1.Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
            return res.json(list.map((n) => ({
                id: n._id.toString(),
                message: n.message,
                isRead: n.isRead,
                type: n.type,
                createdAt: n.createdAt
            })));
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ message: 'Server error retrieving notifications.' });
        }
    }
    static async markAsRead(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'notification id is required.' });
            }
            const notif = await Notification_1.Notification.findOneAndUpdate({ _id: id, userId: req.userId }, { isRead: true }, { new: true });
            if (!notif) {
                return res.status(404).json({ message: 'Notification not found.' });
            }
            return res.json({
                id: notif._id.toString(),
                message: notif.message,
                isRead: notif.isRead,
                type: notif.type,
                createdAt: notif.createdAt
            });
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({ message: 'Server error updating notification.' });
        }
    }
    static async clearAllNotifications(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ message: 'Unauthorized' });
            await Notification_1.Notification.deleteMany({ userId: req.userId });
            return res.json({ message: 'All notifications cleared successfully.' });
        }
        catch (error) {
            console.error('Error clearing notifications:', error);
            return res.status(500).json({ message: 'Server error deleting notifications.' });
        }
    }
}
exports.NotificationController = NotificationController;
