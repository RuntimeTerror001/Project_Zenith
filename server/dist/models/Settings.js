"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = require("mongoose");
const settingsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    soundEnabled: { type: Boolean, default: false },
    musicVolume: { type: Number, default: 0.5 },
    showOrbits: { type: Boolean, default: true },
    showConstellations: { type: Boolean, default: true },
    showSatellites: { type: Boolean, default: true },
    locationName: { type: String, default: 'New York' },
    latitude: { type: Number, default: 40.7128 },
    longitude: { type: Number, default: -74.006 },
    updatedAt: { type: Date, default: Date.now }
});
settingsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.Settings = (0, mongoose_1.model)('Settings', settingsSchema);
