import type { Apod, IssPosition, LiveSpaceEvents, SpaceNewsArticle } from '@/types/zenith';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('project-zenith');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

async function request<T>(
  url: string, 
  method: string = 'GET', 
  body?: any, 
  signal?: AbortSignal
): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const astronomyService = {
  // Telemetry APIs
  getIssPosition: (signal?: AbortSignal) => request<IssPosition>('/api/iss', 'GET', undefined, signal),
  getApod: (signal?: AbortSignal) => request<Apod>('/api/apod', 'GET', undefined, signal),
  getNews: (signal?: AbortSignal) => request<SpaceNewsArticle[]>('/api/news', 'GET', undefined, signal),
  getEvents: (signal?: AbortSignal) => request<LiveSpaceEvents>('/api/events', 'GET', undefined, signal),

  // Authentication APIs
  register: (body: any) => request<any>('/api/auth/register', 'POST', body),
  login: (body: any) => request<any>('/api/auth/login', 'POST', body),
  getProfile: () => request<any>('/api/auth/me', 'GET'),
  updateProfile: (body: any) => request<any>('/api/auth/profile', 'PATCH', body),

  // Favorites APIs
  getFavorites: () => request<any[]>('/api/favorites', 'GET'),
  addFavorite: (objectId: string, objectType: string) => request<any>('/api/favorites', 'POST', { objectId, objectType }),
  removeFavorite: (objectId: string) => request<any>(`/api/favorites/${objectId}`, 'DELETE'),

  // Search History APIs
  getSearchHistory: () => request<any[]>('/api/search/history', 'GET'),
  addSearch: (query: string) => request<any>('/api/search/history', 'POST', { query }),
  clearSearchHistory: () => request<any>('/api/search/history', 'DELETE'),

  // Notifications APIs
  getNotifications: () => request<any[]>('/api/notifications', 'GET'),
  markNotificationRead: (id: string) => request<any>(`/api/notifications/${id}`, 'PATCH'),
  clearNotifications: () => request<any>('/api/notifications', 'DELETE'),

  // Settings APIs
  getSettings: () => request<any>('/api/settings', 'GET'),
  updateSettings: (body: any) => request<any>('/api/settings', 'PATCH', body),

  // Timeline APIs
  getTimeline: (signal?: AbortSignal) => request<any[]>('/api/timeline', 'GET', undefined, signal),

  // Stats API
  getStats: (latitude: number, longitude: number, date?: string, signal?: AbortSignal) => {
    const query = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(date ? { date } : {})
    });
    return request<any>(`/api/stats?${query.toString()}`, 'GET', undefined, signal);
  },

  // Planets API
  getPlanets: (latitude: number, longitude: number, date?: string, signal?: AbortSignal) => {
    const query = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(date ? { date } : {})
    });
    return request<any[]>(`/api/planets?${query.toString()}`, 'GET', undefined, signal);
  },
};
