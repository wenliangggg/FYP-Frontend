import type { BookResponse, VideoResponse, ChatResponse, SearchParams, VideoSearchParams, ChatMessage } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// Error handling utility
class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        errorText || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

// Books API
export async function searchBooks(params: SearchParams): Promise<BookResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.bucket) searchParams.set('bucket', params.bucket);
  if (params.lang) searchParams.set('lang', params.lang);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

  return fetchApi<BookResponse>(`/api/books?${searchParams.toString()}`);
}

// Videos API
export async function searchVideos(params: VideoSearchParams): Promise<VideoResponse> {
  const searchParams = new URLSearchParams();
  
  searchParams.set('q', params.q);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.maxResults) searchParams.set('maxResults', String(params.maxResults));
  if (params.order) searchParams.set('order', params.order);

  return fetchApi<VideoResponse>(`/api/videos?${searchParams.toString()}`);
}

// Chat API
export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  return fetchApi<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(message),
  });
}

// Utility functions
export function getBestBookUrl(book: { 
  previewLink?: string; 
  canonicalVolumeLink?: string; 
  infoLink?: string; 
  id?: string; 
}): string | null {
  return (
    book.previewLink ||
    book.canonicalVolumeLink ||
    book.infoLink ||
    (book.id ? `https://books.google.com/books?id=${encodeURIComponent(book.id)}` : null)
  );
}

export function humanizeBucket(slug: string): string {
  const BUCKET_LABELS: Record<string, string> = {
    juvenile_fiction: 'Fiction',
    juvenile_nonfiction: 'Nonfiction',
    education: 'Education',
    literature: "Children's Literature",
    early_readers: 'Picture/Board/Early',
    middle_grade: 'Middle Grade',
    poetry_humor: 'Poetry & Humor',
    biography: 'Biography',
    juvenile_other: 'Other (Kids)',
    young_adult: 'Young Adult'
  };
  
  return BUCKET_LABELS[slug] || slug.replace(/_/g, ' ');
}

// Cache utilities for prefetching
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Prefetch utilities
export async function prefetchBooks(params: SearchParams): Promise<void> {
  const key = `books_${JSON.stringify(params)}`;
  if (getCachedData(key)) return; // Already cached
  
  try {
    const data = await searchBooks(params);
    setCachedData(key, data);
  } catch (error) {
    // Silently fail for prefetch
    console.warn('Prefetch failed:', error);
  }
}

export async function prefetchVideos(params: VideoSearchParams): Promise<void> {
  const key = `videos_${JSON.stringify(params)}`;
  if (getCachedData(key)) return; // Already cached
  
  try {
    const data = await searchVideos(params);
    setCachedData(key, data);
  } catch (error) {
    // Silently fail for prefetch
    console.warn('Prefetch failed:', error);
  }
}