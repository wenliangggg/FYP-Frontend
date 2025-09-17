import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const REPO = "Kiriao/Rest-API";
const BRANCH = "main";

export async function POST(req: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: "Missing GitHub token" },
        { status: 500 }
      );
    }

    const { category, filename, sha } = await req.json();

    const url = `https://api.github.com/repos/${REPO}/contents/content/${category}/${filename}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Remove ${filename}`,
        branch: BRANCH,
        sha,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
