"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchHistory = void 0;
const mongoose_1 = require("mongoose");
const searchHistorySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
});
// Create compound index for sorting history by date per user
searchHistorySchema.index({ userId: 1, createdAt: -1 });
exports.SearchHistory = (0, mongoose_1.model)('SearchHistory', searchHistorySchema);
