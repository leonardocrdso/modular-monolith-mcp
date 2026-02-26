import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RULES, ANTI_PATTERNS } from "../rule-catalog/index.js";
import { rankRules, scoreRuleByQuery } from "./scoring.js";
import {
  antiPatternsAsRules,
  formatSearchResults,
  MAX_TOTAL_RESULTS,
} from "./format-results.js";

export function registerSearchRuleTool(server: McpServer) {
  server.registerTool(
    "search-rule",
    {
      description:
        "Search Modular Monolith architecture rules by name, keyword, or ID. " +
        "Returns detailed results for top matches and a summary list for additional matches. " +
        "Also searches anti-patterns.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Search term: rule name, keyword, tag, or ID (e.g. 'thin-routes', 'boundary', 'data-isolation')",
          ),
      },
    },
    async ({ query }) => {
      const rankedRules = rankRules(RULES, (rule) =>
        scoreRuleByQuery(rule, query),
      );

      const rankedAntiPatterns = rankRules(
        antiPatternsAsRules(ANTI_PATTERNS),
        (ap) => scoreRuleByQuery(ap, query),
      );

      return formatSearchResults(rankedRules, rankedAntiPatterns, {
        emptyMessage: `No rules or anti-patterns found for "${query}".`,
        remainingHeader: "Other matches",
        maxTotal: MAX_TOTAL_RESULTS,
      });
    },
  );
}
