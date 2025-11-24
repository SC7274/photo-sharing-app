"use client";

import { useState } from "react";
import { AnswerCard } from "./answer-card";

type Hit = {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, string>;
};

export function RagDemo() {
  const [question, setQuestion] = useState(
    "Which captions mention dogs playing in water?",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [hits, setHits] = useState<Hit[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setHits([]);

    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message ?? "Failed to query Moorcheh");
      }

      setAnswer(payload.answer);
      setHits(payload.citations ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error calling Moorcheh.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Live caption search
        </p>
        <h3 className="text-2xl font-semibold text-slate-900">
          Query Moorcheh directly from Node
        </h3>
        <p className="text-sm text-slate-500">
          The form posts to <code>/api/rag</code>, which calls the Moorcheh HTTP
          API with the <code>X-API-Key</code> header—no proxy layer required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-600">
          Question
          <textarea
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-inner focus:border-indigo-400 focus:outline-none"
            rows={3}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask Moorcheh"}
        </button>
      </form>

      {error && (
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      )}

      {answer && (
        <div className="space-y-3 rounded-2xl bg-slate-900 p-5 text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Answer
          </p>
          <p className="text-sm leading-6 text-slate-100">{answer}</p>
          {Boolean(hits.length) && (
            <AnswerCard hits={hits} />
          )}
        </div>
      )}
    </div>
  );
}

