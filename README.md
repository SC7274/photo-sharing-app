<div align="center">
  <h1>Moorcheh RAG Demo</h1>
  <p>A stripped-down Next.js playground you can wire into the Moorcheh Retrieval Augmented Generation platform later.</p>
</div>

## Why this exists

You asked for the photo sharing starter to be simplified into a lightweight Moorcheh RAG demo. Everything unrelated to that goal has been removed from the UI so you can focus on:

- communicating the product narrative to stakeholders
- experimenting with copy, layout, and calls to action
- preparing the hooks you will use once the official Moorcheh SDK lands

## What's included

- ✅ App Router + Tailwind CSS styling
- ✅ Landing page with highlights, integration steps, and roadmap CTA
- ✅ `/api/rag` route that calls the Moorcheh HTTP API from Node.js (using the `X-API-Key` header)
- ✅ Scripts to upload sample photos + captions to Supabase and ingest them into a Moorcheh namespace

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Using the Moorcheh HTTP API from Node.js

The helper in `lib/moorcheh.ts` mirrors the raw fetch call below so you can reuse it in scripts, route handlers, or server actions:

```ts
const apiKey = process.env.MOORCHEH_API_KEY;
const response = await fetch("https://api.moorcheh.ai/v1/namespaces", {
  method: "GET",
  headers: {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  },
});
const namespaces = await response.json();
```

Available helpers:

- `listNamespaces()` – wraps `GET /v1/namespaces`
- `ingestDocuments(namespace, docs)` – posts captions to `POST /v1/namespaces/:namespace/documents`
- `queryNamespace(namespace, question, topK?)` – sends questions to `POST /v1/namespaces/:namespace/rag`

Need quick utilities?

- `npm run moorcheh:namespaces` → lists available namespaces via `GET /v1/namespaces`.
- `npm run moorcheh:push` → reads captions from Supabase and posts them to `POST /v1/namespaces/:namespace/documents`.
- `npm run moorcheh:search -- "dogs playing in snow"` → calls `POST /v1/query/:namespace` so you can test semantic search directly from Node.

## Wire up your own data

1. Seed Supabase with demo media (still via `scripts/upload-images.ts`).
2. Run `ts-node scripts/push-captions.ts` to push `{ id, text, metadata }` documents into your Moorcheh namespace using `POST /v1/namespaces/:namespace/documents`.
3. Visit `/` and use the live form (powered by `/api/rag`) to confirm answers come back with citations.

Environment variables you need:

- `MOORCHEH_API_KEY`
- `MOORCHEH_API_BASE` (defaults to `https://api.moorcheh.ai/v1`)
- `MOORCHEH_NAMESPACE`
- `MOORCHEH_RAG_MODEL` (optional override, defaults to `gpt-4o-mini`)
- `MOORCHEH_TOP_K` (optional)

## Next steps

- Replace the placeholder CTA with your actual waitlist or integration flow.
- Add telemetry (PostHog, Vercel Analytics, etc.) once you need usage insights.
- Expand the API route into a streamed response when the Moorcheh SDK supports it.
- Layer in guardrails/tooling once Moorcheh exposes them over the same HTTP API.
