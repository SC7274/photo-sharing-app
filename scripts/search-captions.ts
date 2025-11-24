import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DEFAULT_BASE_URL = "https://api.moorcheh.ai/v1";

async function run() {
  const [, , ...args] = process.argv;
  const query = args.join(" ").trim();

  if (!query) {
    throw new Error("Usage: npm run moorcheh:search -- \"your query here\"");
  }

  const apiKey = process.env.MOORCHEH_API_KEY;
  const namespace = process.env.MOORCHEH_NAMESPACE;
  const baseUrl = process.env.MOORCHEH_API_BASE ?? DEFAULT_BASE_URL;

  if (!apiKey || !namespace) {
    throw new Error("MOORCHEH_API_KEY and MOORCHEH_NAMESPACE must be set.");
  }

  const response = await fetch(`${baseUrl}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      query,
      namespaces: (process.env.MOORCHEH_NAMESPACES ?? namespace)
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      top_k: Number(process.env.MOORCHEH_TOP_K ?? 5),
      kiosk_mode: process.env.MOORCHEH_KIOSK_MODE === "true",
      threshold: process.env.MOORCHEH_THRESHOLD
        ? Number(process.env.MOORCHEH_THRESHOLD)
        : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Search failed (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

