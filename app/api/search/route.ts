import { NextResponse } from "next/server";

const DEFAULT_BASE = "https://api.moorcheh.ai/v1";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.MOORCHEH_API_KEY;
  const namespace = process.env.MOORCHEH_NAMESPACE;
  const namespaceList =
    process.env.MOORCHEH_NAMESPACES ??
    (namespace ? [namespace].join(",") : undefined);

  if (!apiKey || !namespaceList) {
    return NextResponse.json(
      { error: "RAG environment variables are not configured." },
      { status: 500 },
    );
  }

  try {
    const namespaces = namespaceList
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const resp = await fetch(`${process.env.MOORCHEH_API_BASE ?? DEFAULT_BASE}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        query,
        namespaces,
        top_k: Number(process.env.MOORCHEH_TOP_K ?? 5),
        kiosk_mode: process.env.MOORCHEH_KIOSK_MODE === "true",
        threshold: process.env.MOORCHEH_THRESHOLD
          ? Number(process.env.MOORCHEH_THRESHOLD)
          : undefined,
      }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      return NextResponse.json(
        { error: `Moorcheh query failed: ${body}` },
        { status: resp.status },
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search route error:", error);
    return NextResponse.json(
      { error: "Failed to reach Moorcheh API" },
      { status: 502 },
    );
  }
}

