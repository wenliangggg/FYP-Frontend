'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

// Types
interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  buckets?: string[];
  previewLink?: string;
  canonicalVolumeLink?: string;
  infoLink?: string;
}

interface Video {
  id: string;
  title: string;
  channel?: string;
  thumbnail?: string;
  url?: string;
}

interface BookResponse {
  items: Book[];
  hasMore: boolean;
  totalApprox?: number;
}

interface VideoResponse {
  items: Video[];
  hasMore: boolean;
}

interface ChatResponse {
  reply?: string;
  action?: 'search_books' | 'search_videos';
  params?: {
    q?: string;
    bucket?: string;
    page?: number;
  };
}

type Mode = 'books' | 'videos';

const FALLBACK_THUMB = '/images/book-placeholder.png';
const API_BASE = ""; // Empty for same origin

const SHELVES = [
  { bucket: '', label: 'All' },
  { bucket: 'juvenile_fiction', label: 'Fiction' },
  { bucket: 'juvenile_nonfiction', label: 'Nonfiction' },
  { bucket: 'education', label: 'Education' },
  { bucket: 'literature', label: 'Literature' },
  { bucket: 'early_readers', label: 'Picture/Board/Early' },
  { bucket: 'middle_grade', label: 'Middle Grade' },
  { bucket: 'poetry_humor', label: 'Poetry & Humor' },
  { bucket: 'biography', label: 'Biography' },
  { bucket: 'juvenile_other', label: 'Other (Kids)' },
  { bucket: 'young_adult', label: 'Young Adult' },
];

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

export default function KidsDiscovery() {
  // State
  const [mode, setMode] = useState<Mode>('books');
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState('');
  const [loading, setLoading] = useState(false);

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [bookPage, setBookPage] = useState(1);
  const [bookHasMore, setBookHasMore] = useState(false);
  const [bookTotalApprox, setBookTotalApprox] = useState<number | null>(null);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoPage, setVideoPage] = useState(1);
  const [videoHasMore, setVideoHasMore] = useState(false);

  const PAGE_SIZE = 20;

  // Utility functions
  const bestBookUrl = (book: Book): string | null => {
    return (
      book.previewLink ||
      book.canonicalVolumeLink ||
      book.infoLink ||
      (book.id ? `https://books.google.com/books?id=${encodeURIComponent(book.id)}` : null)
    );
  };

  const humanizeBucket = (slug: string): string => {
    return BUCKET_LABELS[slug] || slug.replace(/_/g, ' ');
  };

  // API calls
  const searchBooks = useCallback(async (page: number = 1) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (bucket) params.set('bucket', bucket);
    params.set('lang', 'en');
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));

    const response = await fetch(`${API_BASE}/api/books?${params.toString()}`);
    return response.json() as Promise<BookResponse>;
  }, [query, bucket]);

  const searchVideos = useCallback(async (page: number = 1) => {
    const params = new URLSearchParams();
    params.set('q', query || 'stories for kids');
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));

    const response = await fetch(`${API_BASE}/api/videos?${params.toString()}`);
    return response.json() as Promise<VideoResponse>;
  }, [query]);

  const callChat = async (message: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lang: 'en' })
    });
    if (!response.ok) throw new Error('chat failed');
    return response.json();
  };

  // Main search function
  const performSearch = async () => {
    setLoading(true);
    try {
      if (mode === 'books') {
        const data = await searchBooks(bookPage);
        setBooks(data.items || []);
        setBookHasMore(!!data.hasMore);
        setBookTotalApprox(typeof data.totalApprox === 'number' ? data.totalApprox : null);
        
        // Prefetch next page
        if (data.hasMore) {
          searchBooks(bookPage + 1).catch(() => {});
        }
      } else {
        const data = await searchVideos(videoPage);
        setVideos(data.items || []);
        setVideoHasMore(!!data.hasMore);
        
        // Prefetch next page
        if (data.hasMore) {
          searchVideos(videoPage + 1).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    performSearch();
  }, [mode, bookPage, videoPage, bucket]);

  // Event handlers
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'books') {
      setBookPage(1);
    } else {
      setVideoPage(1);
    }
  };

  const handleBucketChange = (newBucket: string) => {
    setBucket(newBucket);
    setBookPage(1);
  };

  const handleSearch = () => {
    setBookPage(1);
    setVideoPage(1);
    performSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Pagination helpers
  const PaginationButton = ({ 
    onClick, 
    disabled, 
    children 
  }: { 
    onClick: () => void; 
    disabled?: boolean; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );

  const PageLink = ({ 
    page, 
    current, 
    onClick 
  }: { 
    page: number; 
    current: number; 
    onClick: (page: number) => void;
  }) => (
    <button
      onClick={() => onClick(page)}
      className={`px-3 py-2 rounded-lg border ${
        page === current
          ? 'bg-black text-white border-black'
          : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
      }`}
    >
      {page}
    </button>
  );

  // Render pagination
  const renderBooksPagination = () => {
    const totalPages = bookTotalApprox ? Math.max(1, Math.ceil(bookTotalApprox / PAGE_SIZE)) : null;
    const windowSize = 9;
    const half = Math.floor(windowSize / 2);

    let start = totalPages
      ? Math.max(1, Math.min(bookPage - half, totalPages - windowSize + 1))
      : Math.max(1, bookPage - half);
    let end = totalPages
      ? Math.min(totalPages, start + windowSize - 1)
      : bookPage + half;

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(
        <PageLink
          key={i}
          page={i}
          current={bookPage}
          onClick={(page) => setBookPage(page)}
        />
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
        <PaginationButton
          onClick={() => setBookPage(1)}
          disabled={bookPage === 1}
        >
          <ChevronsLeft className="w-4 h-4" />
        </PaginationButton>
        <PaginationButton
          onClick={() => setBookPage(Math.max(1, bookPage - 1))}
          disabled={bookPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>
        
        {start > 1 && (
          <button
            onClick={() => setBookPage(Math.max(1, bookPage - windowSize))}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
            title="Jump back"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
        
        {pages}
        
        {(totalPages ? end < totalPages : bookHasMore) && (
          <button
            onClick={() => setBookPage(bookPage + windowSize)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
            title="Jump ahead"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
        
        <PaginationButton
          onClick={() => setBookPage(bookPage + 1)}
          disabled={totalPages ? bookPage >= totalPages : !bookHasMore}
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>
        <PaginationButton
          onClick={() => totalPages && setBookPage(totalPages)}
          disabled={!totalPages || bookPage === totalPages}
        >
          <ChevronsRight className="w-4 h-4" />
        </PaginationButton>
      </div>
    );
  };

  const renderVideosPagination = () => {
    return (
      <div className="flex items-center justify-center gap-2 my-4 flex-wrap">
        <PaginationButton
          onClick={() => setVideoPage(1)}
          disabled={videoPage === 1}
        >
          <ChevronsLeft className="w-4 h-4" />
        </PaginationButton>
        <PaginationButton
          onClick={() => setVideoPage(Math.max(1, videoPage - 1))}
          disabled={videoPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </PaginationButton>
        
        {Array.from({ length: 9 }, (_, i) => videoPage + i).map(page => (
          <PageLink
            key={page}
            page={page}
            current={videoPage}
            onClick={(page) => setVideoPage(page)}
          />
        ))}
        
        {videoHasMore && (
          <button
            onClick={() => setVideoPage(videoPage + 9)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
            title="Jump ahead"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
        
        <PaginationButton
          onClick={() => videoHasMore && setVideoPage(videoPage + 1)}
          disabled={!videoHasMore}
        >
          <ChevronRight className="w-4 h-4" />
        </PaginationButton>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-3">Discover Books & Videos for Kids</h1>
      
      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search titles/topics (optional) e.g. dinosaurs, space…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 my-4">
        <button
          onClick={() => handleModeChange('books')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'books'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => handleModeChange('videos')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'videos'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Videos
        </button>
      </div>

      {/* Book Shelves */}
      {mode === 'books' && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SHELVES.map((shelf) => (
            <button
              key={shelf.bucket}
              onClick={() => handleBucketChange(shelf.bucket)}
              className={`px-3 py-2 rounded-full text-sm transition-colors ${
                bucket === shelf.bucket
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {shelf.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-600">Loading…</div>
      )}

      {/* Results Grid */}
      {!loading && (
        <>
          {mode === 'books' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-2xl p-3 flex flex-col gap-2">
                  <img
                    src={book.thumbnail || FALLBACK_THUMB}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg bg-gray-50"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{book.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {(book.authors || []).join(', ') || 'Unknown author'}
                    </p>
                    {book.buckets && book.buckets.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {book.buckets.map((bucketName) => (
                          <span
                            key={bucketName}
                            className="text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-1"
                          >
                            {humanizeBucket(bucketName)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {bestBookUrl(book) && (
                    <a
                      href={bestBookUrl(book)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View on Google Books
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="border border-gray-200 rounded-2xl p-3 flex flex-col gap-2">
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                    {video.channel && (
                      <p className="text-xs text-gray-600">{video.channel}</p>
                    )}
                  </div>
                  {video.url && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Watch on YouTube
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {((mode === 'books' && books.length === 0) || (mode === 'videos' && videos.length === 0)) && (
            <div className="text-center py-8 text-gray-600">
              {mode === 'books' ? 'No books found.' : 'No videos found.'}
            </div>
          )}

          {/* Pagination */}
          {mode === 'books' ? renderBooksPagination() : renderVideosPagination()}
        </>
      )}
    </div>
  );
}