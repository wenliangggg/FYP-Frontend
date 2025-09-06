import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content.toLowerCase();

  let reply = "Sorry, I couldn't find anything.";

  const subjects = [
    'juvenile',
    '"early reader"',
    '"board book"',
    '"picture book"',
    '"children\'s"',
    '"children"',
    '"juvenile fiction"',
    '"juvenile nonfiction"',
  ];

  if (userMessage.includes("book")) {
    let allBooks: any[] = [];

    // Loop through subjects and fetch results
    for (const subject of subjects) {
      const query = `${encodeURIComponent(userMessage)}+subject:${encodeURIComponent(subject)}`;
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.BOOKS_API_KEY}`
      );
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        allBooks.push(...data.items);
      }
    }

    // Remove duplicates and limit to top 3
    const uniqueBooks = Array.from(new Map(allBooks.map(b => [b.id, b])).values()).slice(0, 3);

    if (uniqueBooks.length > 0) {
      reply = "Here are some books:\n\n" +
        uniqueBooks.map((b: any) => `📖 ${b.volumeInfo.title}`).join("\n");
    }
  }

  else if (userMessage.includes("video")) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(
        userMessage
      )}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      reply =
        "Here are some videos:\n\n" +
        data.items.slice(0, 3).map((v: any) => `▶️ ${v.snippet.title} - https://youtube.com/watch?v=${v.id.videoId}`).join("\n");
    }
  }

  return NextResponse.json({ reply });
}
