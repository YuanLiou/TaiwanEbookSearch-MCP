#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const DEFAULT_API_BASE_URL = "https://ebook.yuer.tw";
const API_BASE_URL = process.env.API_BASE_URL || DEFAULT_API_BASE_URL;
const API_VERSION = "v1";
const SERVER_VERSION = "0.1.0";
const USER_AGENT = `TW-EBook-MCP-${SERVER_VERSION}`;
const REQUEST_TIMEOUT_MS = 15000;
const ALLOW_UNSAFE_API_BASE_URL =
  process.env.ALLOW_UNSAFE_API_BASE_URL === "true";

const server = new McpServer({
  name: "taiwan-ebook-search",
  version: SERVER_VERSION,
});

function logError(message: string, error?: unknown) {
  if (error instanceof Error) {
    console.error(`${message}: ${error.name}`);
    return;
  }

  console.error(message);
}

function validateApiBaseUrl() {
  if (API_BASE_URL === DEFAULT_API_BASE_URL) {
    return;
  }

  if (!ALLOW_UNSAFE_API_BASE_URL) {
    throw new Error(
      "Custom API_BASE_URL requires ALLOW_UNSAFE_API_BASE_URL=true",
    );
  }
}

function createRequestUrl(path: string, params?: URLSearchParams) {
  const url = new URL(`${API_VERSION}/${path}`, `${API_BASE_URL}/`);

  if (params) {
    url.search = params.toString();
  }

  return url;
}

async function fetchJson(
  path: string,
  init?: RequestInit,
  params?: URLSearchParams,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(createRequestUrl(path, params), {
      ...init,
      headers: {
        "User-Agent": USER_AGENT,
        ...init?.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false as const,
        userMessage: `Upstream API request failed (${response.status})`,
      };
    }

    const data = await response.json();
    return { ok: true as const, data };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      logError("Upstream API request timed out", error);
      return {
        ok: false as const,
        userMessage: "Upstream API request timed out",
      };
    }

    logError("Upstream API request failed", error);
    return {
      ok: false as const,
      userMessage: "Upstream API request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

// Tool: list_bookstores
server.registerTool(
  "list_bookstores",
  {
    description:
      "List all supported ebook bookstores in Taiwan with their online status",
    inputSchema: z.object({}),
  },
  async () => {
    try {
      const result = await fetchJson("bookstores");

      if (!result.ok) {
        return {
          content: [
            {
              type: "text",
              text: result.userMessage,
            },
          ],
          isError: true,
        };
      }

      const bookstores = result.data;
      return {
        content: [{ type: "text", text: JSON.stringify(bookstores, null, 2) }],
      };
    } catch (error) {
      logError("Failed to fetch bookstores", error);
      return {
        content: [{ type: "text", text: "Failed to fetch bookstores" }],
        isError: true,
      };
    }
  },
);

// Tool: search_ebooks
server.registerTool(
  "search_ebooks",
  {
    description:
      "Search for ebooks across Taiwan bookstores and compare prices. Returns results from multiple bookstores.",
    inputSchema: z.object({
      keywords: z
        .string()
        .describe("Search keywords (book title, author, etc.)"),
      bookstores: z
        .array(z.string())
        .optional()
        .describe(
          "Optional list of bookstore IDs to search. If omitted, searches all online bookstores.",
        ),
    }),
  },
  async ({ keywords, bookstores }) => {
    try {
      const params = new URLSearchParams();
      params.set("q", keywords);

      if (bookstores && bookstores.length > 0) {
        for (const id of bookstores) {
          params.append("bookstores[]", id);
        }
      }

      const result = await fetchJson(
        "searches",
        {
          method: "POST",
        },
        params,
      );

      if (!result.ok) {
        return {
          content: [
            {
              type: "text",
              text: result.userMessage,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    } catch (error) {
      logError("Failed to search ebooks", error);
      return {
        content: [{ type: "text", text: "Failed to search ebooks" }],
        isError: true,
      };
    }
  },
);

// Tool: get_search_result
server.registerTool(
  "get_search_result",
  {
    description: "Retrieve a past search result by its ID",
    inputSchema: z.object({
      id: z.string().describe("The search result ID"),
    }),
  },
  async ({ id }) => {
    try {
      const result = await fetchJson(`searches/${encodeURIComponent(id)}`);

      if (!result.ok) {
        return {
          content: [
            {
              type: "text",
              text: result.userMessage,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    } catch (error) {
      logError("Failed to get search result", error);
      return {
        content: [{ type: "text", text: "Failed to get search result" }],
        isError: true,
      };
    }
  },
);

async function main() {
  validateApiBaseUrl();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Taiwan Ebook Search MCP Server running on stdio");
  console.error(
    `API Base URL: ${API_BASE_URL === DEFAULT_API_BASE_URL ? DEFAULT_API_BASE_URL : "custom (override enabled)"}`,
  );
}

main().catch((error) => {
  logError("Fatal error in main()", error);
  process.exit(1);
});
