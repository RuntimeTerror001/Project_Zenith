"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const Settings_1 = require("../models/Settings");
class SettingsController {
    static async getSettings(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ message: 'Unauthorized' });
            let settings = await Settings_1.Settings.findOne({ userId: req.userId });
            // If no settings exist yet for this user, create default ones
            if (!settings) {
                settings = new Settings_1.Settings({
                    userId: req.userId,
                });
                await settings.save();
            }
            return res.json({
                soundEnabled: settings.soundEnabled,
                musicVolume: settings.musicVolume,
                showOrbits: settings.showOrbits,
                showConstellations: settings.showConstellations,
                showSatellites: settings.showSatellites,
                locationName: settings.locationName,
                latitude: settings.latitude,
                longitude: settings.longitude,
                updatedAt: settings.updatedAt,
            });
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ message: 'Server error retrieving settings.' });
        }
    }
    static async updateSettings(req, res) {
        try {
            if (!req.userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const { soundEnabled, musicVolume, showOrbits, showConstellations, showSatellites, locationName, latitude, longitude, } = req.body;
            let settings = await Settings_1.Settings.findOne({ userId: req.userId });
            if (!settings) {
                settings = new Settings_1.Settings({ userId: req.userId });
            }
            if (soundEnabled !== undefined)
                settings.soundEnabled = soundEnabled;
            if (musicVolume !== undefined)
                settings.musicVolume = musicVolume;
            if (showOrbits !== undefined)
                settings.showOrbits = showOrbits;
            if (showConstellations !== undefined)
                settings.showConstellations = showConstellations;
            if (showSatellites !== undefined)
                settings.showSatellites = showSatellites;
            if (locationName !== undefined)
                settings.locationName = locationName;
            if (latitude !== undefined)
                settings.latitude = latitude;
            if (longitude !== undefined)
                settings.longitude = longitude;
            await settings.save();
            return res.json({
                soundEnabled: settings.soundEnabled,
                musicVolume: settings.musicVolume,
                showOrbits: settings.showOrbits,
                showConstellations: settings.showConstellations,
                showSatellites: settings.showSatellites,
                locationName: settings.locationName,
                latitude: settings.latitude,
                longitude: settings.longitude,
                updatedAt: settings.updatedAt,
            });
        }
        catch (error) {
            console.error('Error updating settings:', error);
            return res.status(500).json({ message: 'Server error updating settings.' });
        }
    }
}
exports.SettingsController = SettingsController;
