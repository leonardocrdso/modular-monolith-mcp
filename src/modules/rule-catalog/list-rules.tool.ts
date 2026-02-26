import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RULES, filterByCategory } from "./rules.js";
import { CATEGORIES, isValidCategory } from "../../shared/categories.js";
import { formatRuleList, formatCatalogGrouped } from "./rule-formatter.js";

export function registerListRulesTool(server: McpServer) {
  server.registerTool(
    "list-rules",
    {
      description:
        "List Modular Monolith architecture rules, optionally filtered by category. " +
        "Without a category, returns the full catalog grouped by topic.",
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(
            `Category to filter by. Valid categories: ${CATEGORIES.join(", ")}`,
          ),
      },
    },
    async ({ category }) => {
      if (category && !isValidCategory(category)) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid category "${category}". Valid categories: ${CATEGORIES.join(", ")}`,
            },
          ],
        };
      }

      if (category) {
        const filtered = filterByCategory(category);
        return {
          content: [{ type: "text", text: formatRuleList(filtered) }],
        };
      }

      return {
        content: [{ type: "text", text: formatCatalogGrouped(RULES) }],
      };
    },
  );
}
