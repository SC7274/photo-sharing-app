import { NextResponse } from "next/server";
import { queryNamespace } from "@/lib/moorcheh";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question: string =
    body?.question?.toString().trim() ||
    "What can Moorcheh RAG do for me?";

  const namespaceList =
    process.env.MOORCHEH_NAMESPACES ??
    process.env.MOORCHEH_NAMESPACE ??
    "photo-album";
  const namespaces = namespaceList
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  try {
    const { answer, hits } = await queryNamespace(namespaces, question);

    return NextResponse.json({
      question,
      answer,
      citations: hits,
    });
  } catch (error) {
    console.error("Error querying Moorcheh:", error);
    return NextResponse.json(
      {
        question,
        answer:
          "We could not reach Moorcheh right now. Double-check your API key, namespace, and network connection.",
        citations: [],
      },
      { status: 500 },
    );
  }
}

