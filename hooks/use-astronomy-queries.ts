'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_TIMING } from '@/constants/query';
import { astronomyService } from '@/services/astronomy';

export function useIssPosition() {
  return useQuery({ queryKey: QUERY_KEYS.iss, queryFn: ({ signal }) => astronomyService.getIssPosition(signal), refetchInterval: QUERY_TIMING.livePoll, staleTime: QUERY_TIMING.liveStale });
}

export function useApod() {
  return useQuery({ queryKey: QUERY_KEYS.apod, queryFn: ({ signal }) => astronomyService.getApod(signal), staleTime: QUERY_TIMING.contentStale, gcTime: QUERY_TIMING.contentGc });
}

export function useSpaceNews() {
  return useQuery({ queryKey: QUERY_KEYS.news, queryFn: ({ signal }) => astronomyService.getNews(signal), staleTime: QUERY_TIMING.contentStale, gcTime: QUERY_TIMING.contentGc });
}

export function useLiveSpaceEvents() {
  return useQuery({ queryKey: QUERY_KEYS.events, queryFn: ({ signal }) => astronomyService.getEvents(signal), refetchInterval: 15 * 60_000, staleTime: 5 * 60_000, gcTime: QUERY_TIMING.contentGc });
}
