import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RULES, formatRuleAsMarkdown } from "../rule-catalog/index.js";
import { CATEGORIES, isValidCategory, type RuleCategory } from "../../shared/categories.js";

const DEFAULT_FOCUS_CATEGORIES: RuleCategory[] = [
  "module-boundaries",
  "module-communication",
  "data-isolation",
  "dependency-management",
];

export function registerArchitectureReviewPrompt(server: McpServer) {
  server.registerPrompt(
    "architecture-review",
    {
      description:
        "Generate an architecture review prompt with relevant Modular Monolith rules embedded. " +
        "Provide code to review and optionally focus on specific categories.",
      argsSchema: {
        code: z.string().describe("The source code to review"),
        language: z
          .string()
          .optional()
          .describe(
            "Programming language of the code (e.g. 'typescript', 'python')",
          ),
        focus_categories: z
          .string()
          .optional()
          .describe(
            `Comma-separated categories to focus on. Valid: ${CATEGORIES.join(", ")}`,
          ),
      },
    },
    ({ code, language, focus_categories }) => {
      const categories = parseFocusCategories(focus_categories);
      const relevantRules = RULES.filter((r) =>
        categories.includes(r.category),
      );

      const rulesReference = relevantRules
        .map(formatRuleAsMarkdown)
        .join("\n\n---\n\n");

      const languageHint = language ? ` (${language})` : "";

      const prompt = buildReviewPrompt(
        code,
        languageHint,
        categories,
        rulesReference,
      );

      return {
        messages: [
          {
            role: "user" as const,
            content: { type: "text" as const, text: prompt },
          },
        ],
      };
    },
  );
}

function parseFocusCategories(raw: string | undefined): RuleCategory[] {
  if (!raw) return DEFAULT_FOCUS_CATEGORIES;

  const parsed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(isValidCategory);

  return parsed.length > 0 ? parsed : DEFAULT_FOCUS_CATEGORIES;
}

function buildReviewPrompt(
  code: string,
  languageHint: string,
  categories: RuleCategory[],
  rulesReference: string,
): string {
  return `# Modular Monolith Architecture Review

Please review the following code${languageHint} against Modular Monolith architecture rules, focusing on these categories: **${categories.join(", ")}**.

## Code to Review

\`\`\`
${code}
\`\`\`

## Review Instructions

For each issue found:
1. Identify the specific architecture rule being violated (include the rule ID)
2. Explain why this matters for module boundaries and maintainability
3. Suggest a concrete improvement with a code example
4. Reference related Clean Code principles where applicable

Prioritize the most impactful architectural issues first. Be specific and actionable.

**Ecosystem tip:** For a complete review, also use the \`clean-code-review\` prompt from the clean-code-mcp server to check code-level quality.

## Architecture Rules Reference

${rulesReference}`;
}
