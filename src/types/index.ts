// Book types
export interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  buckets?: string[];
  previewLink?: string;
  canonicalVolumeLink?: string;
  infoLink?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  language?: string;
}

export interface BookResponse {
  items: Book[];
  hasMore: boolean;
  totalApprox?: number;
}

// Video types
export interface Video {
  id: string;
  title: string;
  channel?: string;
  channelId?: string;
  thumbnail?: string;
  url?: string;
  description?: string;
  publishedAt?: string;
  duration?: string;
  viewCount?: string;
}

export interface VideoResponse {
  items: Video[];
  hasMore: boolean;
  nextPageToken?: string;
}

// Chat types
export interface ChatMessage {
  message: string;
  lang?: string;
}

export interface ChatResponse {
  reply?: string;
  action?: 'search_books' | 'search_videos' | 'general';
  params?: {
    q?: string;
    bucket?: string;
    page?: number;
  };
  error?: string;
}

// UI types
export type Mode = 'books' | 'videos';

export interface Shelf {
  bucket: string;
  label: string;
}

// API types
export interface SearchParams {
  q?: string;
  bucket?: string;
  lang?: string;
  page?: number;
  pageSize?: number;
}

export interface VideoSearchParams {
  q: string;
  page?: number;
  pageSize?: number;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}