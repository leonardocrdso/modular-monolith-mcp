import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RULES, ANTI_PATTERNS } from "../rule-catalog/index.js";
import { rankRules, scoreRuleByTokens } from "./scoring.js";
import { tokenize, removeStopWords, detectCategoryBoosts } from "./tokenizer.js";
import { antiPatternsAsRules, formatSearchResults } from "./format-results.js";

const MAX_CONTEXT_RESULTS = 8;

export function registerSearchByContextTool(server: McpServer) {
  server.registerTool(
    "search-by-context",
    {
      description:
        "Find relevant Modular Monolith architecture rules for a given situation or problem description. " +
        "Describe what you're dealing with in natural language (e.g. 'my modules are importing from each other's internal files').",
      inputSchema: {
        context: z
          .string()
          .describe(
            "Description of the architectural situation, problem, or question in natural language",
          ),
      },
    },
    async ({ context }) => {
      const tokens = removeStopWords(tokenize(context));
      const categoryBoosts = detectCategoryBoosts(tokens);

      const rankedRules = rankRules(RULES, (rule) =>
        scoreRuleByTokens(rule, tokens, categoryBoosts),
      );

      const rankedAntiPatterns = rankRules(
        antiPatternsAsRules(ANTI_PATTERNS),
        (ap) => scoreRuleByTokens(ap, tokens, categoryBoosts),
      );

      return formatSearchResults(rankedRules, rankedAntiPatterns, {
        emptyMessage: "No rules found matching that context.",
        remainingHeader: "Also relevant",
        maxTotal: MAX_CONTEXT_RESULTS,
      });
    },
  );
}
