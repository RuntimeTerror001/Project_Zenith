"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const mongoose_1 = require("mongoose");
const favoriteSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    objectId: { type: String, required: true },
    objectType: {
        type: String,
        required: true,
        enum: ['planet', 'constellation', 'event', 'satellite']
    },
    createdAt: { type: Date, default: Date.now }
});
// Enforce unique favorites per user to prevent duplicate records
favoriteSchema.index({ userId: 1, objectId: 1, objectType: 1 }, { unique: true });
exports.Favorite = (0, mongoose_1.model)('Favorite', favoriteSchema);
