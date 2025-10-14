// app/api/github/list-files/route.ts
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "Kiriao/Rest-API";
const BRANCH = "main";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "books"; // default books
    const folder = `content/${category}`;

    const url = `https://api.github.com/repos/${REPO}/contents/${folder}?ref=${BRANCH}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to list files");

    const files = data
      .filter((f: any) => f.type === "file" && f.name.endsWith(".json"))
      .map((f: any) => ({ name: f.name, path: f.path, sha: f.sha }));

    return NextResponse.json(files);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
