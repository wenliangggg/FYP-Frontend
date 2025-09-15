// app/api/github/get-file/route.ts
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "Kiriao/Rest-API";
const BRANCH = "main";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const url = `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.message }, { status: 500 });

  // decode Base64 content
  const content = data.content ? Buffer.from(data.content, "base64").toString("utf-8") : "";
  return NextResponse.json(JSON.parse(content));
}
