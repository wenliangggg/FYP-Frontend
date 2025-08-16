import { NextResponse } from "next/server";

const BOOKS_API_KEY = process.env.BOOKS_API_KEY || "";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

export async function GET() {
  return NextResponse.json({
    booksKeySeen: Boolean(BOOKS_API_KEY),
    ytKeySeen: Boolean(YOUTUBE_API_KEY),
    runtime: "nextjs edge/serverless",
  });
}
