import { RagDemo } from "@/components/rag-demo";

import ImageGallery from "@/components/image-gallery";


const highlights = [
  {
    title: "Retrieval-first",
    body: "Ground answers on curated Moorcheh corpora with hybrid vector + keyword search.",
  },
  {
    title: "Latency aware",
    body: "Streaming responses stay under 2s P95 thanks to lightweight orchestration.",
  },
  {
    title: "Safe to extend",
    body: "Add your tools and guardrails later without rewriting the ingestion pipeline.",
  },
];

const integrationSteps = [
  "Connect your Moorcheh index and secrets via server actions.",
  "Drop in the provided chat component or call the `/api/rag` route.",
  "Tune prompts + ranking weights, then flip the production flag.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
        {/* <header className="space-y-6 text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Moorcheh RAG demo build
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            A tiny playground for your future Moorcheh Retrieval Augmented
            Generation workflow
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            This repo is intentionally bare-bones. It showcases the UI shell and
            data flow you will wire into the Moorcheh platform when the official
            SDK is available. Use it to test copy, explain the architecture to
            stakeholders, or spike integrations without committing to a backend.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span>Next.js App Router</span>
            <span>Tailwind CSS</span>
            <span>Server Actions ready</span>
          </div>
        </header> */}

        {/* <section className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-indigo-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Integration checklist
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Wire your own Moorcheh credentials when you are ready
          </h3>
          <ol className="mt-6 space-y-4 text-slate-600">
            {integrationSteps.map((step, index) => (
              <li key={step} className="flex gap-4 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-slate-500">
            Need to showcase something interactive today? Point your local data
            at Supabase, run the ingestion script, and the `/api/rag` route will
            call the hosted Moorcheh HTTP API using your `X-API-Key`.
          </p>
        </section> */}
        <ImageGallery />
        <RagDemo />

        {/* <section className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
              Coming soon
            </p>
            <h4 className="mt-2 text-2xl font-semibold">
              Moorcheh CLI & ingestion helpers
            </h4>
            <p className="mt-2 text-sm text-slate-300">
              We will drop the scripts you need to push documents, inspect
              embeddings, and sync knowledge bases directly from this repo.
            </p>
          </div>
          <button className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400">
            Keep me posted
          </button>
        </section> */}
      </section>
    </main>
  );
}
