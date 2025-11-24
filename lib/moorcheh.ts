const DEFAULT_BASE_URL = "https://api.moorcheh.ai/v1";

type JsonRecord = Record<string, string | number | boolean | null>;

export type MoorchehDocument = {
  id: string;
  text: string;
  metadata?: JsonRecord;
};

export type RagHit = {
  id: string;
  text: string;
  score: number;
  metadata?: JsonRecord;
};

type MoorchehSearchDocument = {
  id?: string;
  text?: string;
  metadata?: JsonRecord;
};

type MoorchehSearchResult = {
  namespace?: string;
  score?: number;
  document?: MoorchehSearchDocument;
  id?: string;
  text?: string;
  metadata?: JsonRecord;
};

type MoorchehSearchResponse = {
  results: MoorchehSearchResult[];
};

function getApiKey() {
  const value =
    process.env.MOORCHEH_API_KEY ??
    process.env.MOORCHE_API_KEY; // support legacy spelling from docs

  if (!value) {
    throw new Error(
      "Missing required environment variable: MOORCHEH_API_KEY (or MOORCHE_API_KEY)",
    );
  }

  return value;
}

function getBaseHeaders(extra?: HeadersInit) {
  const apiKey = getApiKey();
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    ...extra,
  };
}

async function callMoorcheh<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.MOORCHEH_API_BASE ?? DEFAULT_BASE_URL;

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: getBaseHeaders(init.headers),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Moorcheh API request failed (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return (await response.json()) as T;
}

export async function listNamespaces() {
  return callMoorcheh<{ namespaces: Array<{ name: string }> }>("/namespaces", {
    method: "GET",
  });
}

export async function ingestDocuments(
  namespace: string,
  documents: MoorchehDocument[],
) {
  return callMoorcheh(`/namespaces/${namespace}/documents`, {
    method: "POST",
    body: JSON.stringify({ documents }),
  });
}

export async function queryNamespace(
  namespaces: string[],
  question: string,
  topK = Number(process.env.MOORCHEH_TOP_K ?? 4),
) {
  const payload: Record<string, unknown> = {
    query: question,
    namespaces,
    top_k: topK,
  };

  if (process.env.MOORCHEH_KIOSK_MODE === "true") {
    payload.kiosk_mode = true;
  }

  if (process.env.MOORCHEH_THRESHOLD) {
    payload.threshold = Number(process.env.MOORCHEH_THRESHOLD);
  }

  const response = await callMoorcheh<MoorchehSearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const hits: RagHit[] = response.results.map((result, index) => {
    const docText = result.document?.text ?? result.text ?? "";
    return {
      id:
        result.document?.id ??
        result.id ??
        `${result.namespace ?? "ns"}-${index}`,
      text: docText,
      score: typeof result.score === "number" ? result.score : 0,
      metadata: result.document?.metadata ?? result.metadata,
    };
  });

  const answer =
    hits.length > 0
      ? `Closest caption: "${hits[0].text}" (score ${(hits[0].score ?? 0).toFixed(
          3,
        )}).`
      : "No matching captions found in Moorcheh.";

  return {
    answer,
    hits,
  };
}

