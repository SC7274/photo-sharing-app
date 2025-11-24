import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const DEFAULT_BASE_URL = "https://api.moorcheh.ai/v1";
const BATCH_SIZE = 100;


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ImageRow = {
  id: string;
  file_path: string;
  caption: string;
};

type MoorchehDoc = {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
};

async function fetchCaptions() {
  const { data, error } = await supabase
    .from("images")
    .select("id,file_path,caption");

  if (error) {
    throw error;
  }

  return (data as ImageRow[]) ?? [];
}

async function ingestDocuments(documents: MoorchehDoc[]) {
  const apiKey = process.env.MOORCHEH_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MOORCHEH_API_KEY");
  }

  const baseUrl = process.env.MOORCHEH_API_BASE ?? DEFAULT_BASE_URL;
  const namespace = process.env.MOORCHEH_NAMESPACE ?? "photo-album";

  const response = await fetch(`${baseUrl}/namespaces/${namespace}/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ documents }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to ingest documents (${response.status} ${response.statusText}): ${body}`,
    );
  }
}

async function run() {
  const captions = await fetchCaptions();

  console.log(`Preparing ${captions.length} captions for Moorcheh ingestion...`);

  for (let i = 0; i < captions.length; i += BATCH_SIZE) {
    const chunk: MoorchehDoc[] = captions.slice(i, i + BATCH_SIZE).map((item) => ({
      id: `${item.file_path}`,
      text: `The caption for this image is: ${item.caption}`,
      metadata: {
        file_path: `${item.file_path}`,
        image_id: item.id,
      },
    }));

    await ingestDocuments(chunk);
    console.log(`Uploaded batch ${i / BATCH_SIZE + 1}`);
  }

  console.log("All captions synced to Moorcheh!");
}

run().catch((error) => {
  console.error("Failed to push captions to Moorcheh:", error);
  process.exit(1);
});

