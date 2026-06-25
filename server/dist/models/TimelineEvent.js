"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineEvent = void 0;
const mongoose_1 = require("mongoose");
const timelineEventSchema = new mongoose_1.Schema({
    year: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    facts: { type: [String], default: [] },
    celestial: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Historic', 'Milestone', 'Present', 'Upcoming', 'Future']
    },
    createdAt: { type: Date, default: Date.now }
});
exports.TimelineEvent = (0, mongoose_1.model)('TimelineEvent', timelineEventSchema);
