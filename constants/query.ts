export const QUERY_TIMING = {
  livePoll: 10_000,
  liveStale: 5_000,
  contentStale: 30 * 60_000,
  contentGc: 24 * 60 * 60_000,
} as const;

export const QUERY_KEYS = {
  iss: ['iss-position'] as const,
  apod: ['astronomy-picture-of-the-day'] as const,
  news: ['space-news'] as const,
  events: ['live-space-events'] as const,
  timeline: ['timeline-events'] as const,
  stats: ['astronomy-stats'] as const,
  planets: ['planets-data'] as const,
  settings: ['user-settings'] as const,
} as const;
