import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { ingestDocuments, MoorchehDocument } from "../lib/moorcheh";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const namespace = process.env.MOORCHEH_NAMESPACE ?? "photo-album";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from("images")
    .select("id, file_path, caption");

  if (error) {
    throw error;
  }

  const documents: MoorchehDocument[] =
    data?.map((item) => ({
      id: item.file_path,
      text: item.caption,
      metadata: {
        image_id: item.id,
        file_path: item.file_path,
      },
    })) ?? [];

  if (!documents.length) {
    console.log("No captions found to ingest.");
    return;
  }

  await ingestDocuments(namespace, documents);

  console.log(`Uploaded ${documents.length} captions to namespace "${namespace}".`);
}

run().catch((err) => {
  console.error("Failed to ingest captions:", err);
  process.exit(1);
});

