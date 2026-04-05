#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE_URL = process.env.API_BASE_URL || "https://ebook.yuer.tw";
const API_VERSION = "v1";
const SERVER_VERSION = "0.1.0";
const USER_AGENT = `TW-EBook-MCP-${SERVER_VERSION}`;

const server = new McpServer({
  name: "taiwan-ebook-search",
  version: SERVER_VERSION,
});

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
      const response = await fetch(
        `${API_BASE_URL}/${API_VERSION}/bookstores`,
        {
          headers: { "User-Agent": USER_AGENT },
        },
      );

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `API error: ${response.status} ${response.statusText}`,
            },
          ],
          isError: true,
        };
      }

      const bookstores = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(bookstores, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Failed to fetch bookstores: ${error}` },
        ],
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

      const response = await fetch(
        `${API_BASE_URL}/${API_VERSION}/searches?${params.toString()}`,
        {
          method: "POST",
          headers: { "User-Agent": USER_AGENT },
        },
      );

      if (!response.ok) {
        const body = await response.text();
        return {
          content: [
            {
              type: "text",
              text: `API error: ${response.status} ${response.statusText}\n${body}`,
            },
          ],
          isError: true,
        };
      }

      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Failed to search ebooks: ${error}` }],
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
      const response = await fetch(
        `${API_BASE_URL}/${API_VERSION}/searches/${encodeURIComponent(id)}`,
        {
          headers: { "User-Agent": USER_AGENT },
        },
      );

      if (!response.ok) {
        const body = await response.text();
        return {
          content: [
            {
              type: "text",
              text: `API error: ${response.status} ${response.statusText}\n${body}`,
            },
          ],
          isError: true,
        };
      }

      const result = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Failed to get search result: ${error}` },
        ],
        isError: true,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Taiwan Ebook Search MCP Server running on stdio");
  console.error(`API Base URL: ${API_BASE_URL}`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
