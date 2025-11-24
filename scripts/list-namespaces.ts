import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const DEFAULT_BASE_URL = "https://api.moorcheh.ai/v1";

async function listNamespaces() {
  const apiKey = process.env.MOORCHEH_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MOORCHEH_API_KEY. Set it in your .env.local file.");
  }

  const baseUrl = process.env.MOORCHEH_API_BASE ?? DEFAULT_BASE_URL;

  const response = await fetch(`${baseUrl}/namespaces`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to list namespaces (${response.status} ${response.statusText}): ${body}`,
    );
  }

  const data = await response.json();
  console.log("Namespaces:", JSON.stringify(data, null, 2));
}

listNamespaces().catch((error) => {
  console.error(error);
  process.exit(1);
});

