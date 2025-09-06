// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    booksKeySeen: Boolean(process.env.BOOKS_API_KEY),
    ytKeySeen: Boolean(process.env.YOUTUBE_API_KEY),
    status: 'OK',
    timestamp: new Date().toISOString()
  });
}