// app/components/DiscoverPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';

// Types
interface Book {
  id: string;
  title: string;
  authors: string[];
  categories: string[];
  maturityRating: string;
  thumbnail?: string;
  previewLink?: string;
  canonicalVolumeLink?: string;
  infoLink?: string;
  bestLink?: string;
  snippet?: string;
  buckets?: string[];
}

interface Video {
  title: string;
  channel: string;
  channelId: string;
  videoId: string;
  thumbnail?: string;
  publishedAt: string;
  url?: string;
  categoryHint: number;
}

interface BooksResponse {
  items: Book[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalApprox?: number;
}

interface VideosResponse {
  items: Video[];
  page: number;
  pageSize: number;
  hasMore: boolean;
}

const FALLBACK_THUMB = '/images/book-placeholder.png';

const bucketDisplayNames = {
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

export default function DiscoverPage() {
  // State
  const [mode, setMode] = useState<'books' | 'videos'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [bucket, setBucket] = useState('');
  const [booksPage, setBooksPage] = useState(1);
  const [booksHasMore, setBooksHasMore] = useState(false);
  const [totalApprox, setTotalApprox] = useState<number | null>(null);
  
  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosPage, setVideosPage] = useState(1);
  const [videosHasMore, setVideosHasMore] = useState(false);

  const pageSize = 20;

  // Helper functions
  const bestBookUrl = (book: Book): string | null => {
    return (
      book.previewLink ||
      book.canonicalVolumeLink ||
      book.infoLink ||
      (book.id ? `https://books.google.com/books?id=${encodeURIComponent(book.id)}` : null)
    );
  };

  const humanizeBucket = (slug: string): string => {
    return bucketDisplayNames[slug as keyof typeof bucketDisplayNames] || slug.replace(/_/g, ' ');
  };

  // API calls
  const searchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (bucket) params.set('bucket', bucket);
      params.set('lang', 'en');
      params.set('page', String(booksPage));
      params.set('pageSize', String(pageSize));

      const response = await fetch(`/api/books?${params.toString()}`);
      const data: BooksResponse = await response.json();

      setBooks(data.items || []);
      setBooksHasMore(!!data.hasMore);
      setTotalApprox(typeof data.totalApprox === 'number' ? data.totalApprox : null);
    } catch (error) {
      console.error('Books search failed:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim() || 'stories for kids');
      params.set('page', String(videosPage));
      params.set('pageSize', String(pageSize));

      const response = await fetch(`/api/videos?${params.toString()}`);
      const data: VideosResponse = await response.json();

      setVideos(data.items || []);
      setVideosHasMore(!!data.hasMore);
    } catch (error) {
      console.error('Videos search failed:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (mode === 'books') {
      searchBooks();
    } else {
      searchVideos();
    }
  }, [mode, booksPage, videosPage, bucket]);

  // Initial search
  useEffect(() => {
    searchBooks();
  }, []);

  // Event handlers
  const handleSearch = () => {
    setBooksPage(1);
    setVideosPage(1);
    if (mode === 'books') {
      searchBooks();
    } else {
      searchVideos();
    }
  };

  const handleModeChange = (newMode: 'books' | 'videos') => {
    setMode(newMode);
    if (newMode === 'books') {
      setBooksPage(1);
    } else {
      setVideosPage(1);
    }
  };

  const handleBucketChange = (newBucket: string) => {
    setBucket(newBucket);
    setBooksPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Pagination components
  const BooksPagination = () => {
    const totalPages = totalApprox ? Math.max(1, Math.ceil(totalApprox / pageSize)) : null;
    const windowSize = 9;
    const half = Math.floor(windowSize / 2);

    const start = totalPages
      ? Math.max(1, Math.min(booksPage - half, totalPages - windowSize + 1))
      : Math.max(1, booksPage - half);
    const end = totalPages
      ? Math.min(totalPages, start + windowSize - 1)
      : booksPage + half;

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap bg-white">
        <button
          onClick={() => setBooksPage(1)}
          disabled={booksPage === 1}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setBooksPage(Math.max(1, booksPage - 1))}
          disabled={booksPage === 1}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {start > 1 && (
          <button
            onClick={() => setBooksPage(Math.max(1, booksPage - windowSize))}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Jump back"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setBooksPage(pageNum)}
            className={`px-3 py-2 border rounded-lg ${
              pageNum === booksPage
                ? 'bg-black text-white border-black'
                : 'hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {(totalPages ? end < totalPages : booksHasMore) && (
          <button
            onClick={() => setBooksPage(booksPage + windowSize)}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Jump ahead"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setBooksPage(booksPage + 1)}
          disabled={totalPages ? booksPage >= totalPages : !booksHasMore}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => totalPages && setBooksPage(totalPages)}
          disabled={!totalPages || booksPage === totalPages}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const VideosPagination = () => {
    const windowSize = 9;
    const start = videosPage;
    const end = videosPage + windowSize - 1;

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        <button
          onClick={() => setVideosPage(1)}
          disabled={videosPage === 1}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setVideosPage(Math.max(1, videosPage - 1))}
          disabled={videosPage === 1}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setVideosPage(pageNum)}
            className={`px-3 py-2 border rounded-lg ${
              pageNum === videosPage
                ? 'bg-black text-white border-black'
                : 'hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {videosHasMore && (
          <button
            onClick={() => setVideosPage(videosPage + windowSize)}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Jump ahead"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setVideosPage(videosPage + 1)}
          disabled={!videosHasMore}
          className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans text-gray-900">
      <h1 className="text-2xl font-bold mb-3">Discover Books & Videos for Kids</h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search titles/topics (optional) e.g. dinosaurs, space…"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleModeChange('books')}
          className={`px-4 py-2 rounded-lg ${
            mode === 'books'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Books
        </button>
        <button
          onClick={() => handleModeChange('videos')}
          className={`px-4 py-2 rounded-lg ${
            mode === 'videos'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Videos
        </button>
      </div>

      {/* Category Shelves - Only for Books */}
      {mode === 'books' && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleBucketChange('')}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              bucket === ''
                ? 'bg-black text-white border-black'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(bucketDisplayNames).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleBucketChange(key)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                bucket === key
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-600">
          Loading...
        </div>
      )}

      {/* Results Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {mode === 'books'
            ? books.map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                  <img
                    src={book.thumbnail || FALLBACK_THUMB}
                    alt={book.title}
                    className="w-full h-40 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}
                    </p>
                    {book.buckets && book.buckets.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.buckets.map((bucketItem) => (
                          <span
                            key={bucketItem}
                            className="text-xs bg-gray-100 border border-gray-300 rounded-full px-2 py-0.5"
                          >
                            {humanizeBucket(bucketItem)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {bestBookUrl(book) && (
                    <a
                      href={bestBookUrl(book)!}
                      target="_blank"
                      rel="noopener"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View on Google Books
                    </a>
                  )}
                </div>
              ))
            : videos.map((video, index) => (
                <div key={`${video.videoId}-${index}`} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-40 object-cover rounded-lg bg-gray-100"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                    {video.channel && (
                      <p className="text-xs text-gray-600 mt-1">{video.channel}</p>
                    )}
                  </div>
                  {video.url && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Watch on YouTube
                    </a>
                  )}
                </div>
              ))
          }
        </div>
      )}

      {/* No Results */}
      {!loading && mode === 'books' && books.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No books found.
        </div>
      )}

      {!loading && mode === 'videos' && videos.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No videos found.
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <>
          {mode === 'books' && books.length > 0 && <BooksPagination />}
          {mode === 'videos' && videos.length > 0 && <VideosPagination />}
        </>
      )}
    </div>
  );
}