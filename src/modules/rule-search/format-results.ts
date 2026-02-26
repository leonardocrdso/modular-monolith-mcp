import type { ArchitectureRule, AntiPattern } from "../rule-catalog/index.js";
import {
  formatRuleAsMarkdown,
  formatAntiPatternAsMarkdown,
  formatRuleList,
} from "../rule-catalog/index.js";

export const MAX_DETAILED_RESULTS = 3;
export const MAX_TOTAL_RESULTS = 10;

type TaggedResult =
  | { type: "rule"; item: ArchitectureRule }
  | { type: "anti-pattern"; item: ArchitectureRule };

export function antiPatternsAsRules(
  antiPatterns: AntiPattern[],
): (AntiPattern & { rationale: string })[] {
  return antiPatterns.map((ap) => ({ ...ap, rationale: ap.description }));
}

export function formatSearchResults(
  rankedRules: ArchitectureRule[],
  rankedAntiPatterns: ArchitectureRule[],
  options: { emptyMessage: string; remainingHeader: string; maxTotal?: number },
): { content: { type: "text"; text: string }[] } {
  const maxTotal = options.maxTotal ?? MAX_TOTAL_RESULTS;

  const allResults: TaggedResult[] = [
    ...rankedRules.map((r) => ({ type: "rule" as const, item: r })),
    ...rankedAntiPatterns.map((ap) => ({
      type: "anti-pattern" as const,
      item: ap,
    })),
  ].slice(0, maxTotal);

  if (allResults.length === 0) {
    return {
      content: [{ type: "text", text: options.emptyMessage }],
    };
  }

  const detailed = allResults.slice(0, MAX_DETAILED_RESULTS);
  const remaining = allResults.slice(MAX_DETAILED_RESULTS, maxTotal);

  const parts = detailed.map(({ type, item }) =>
    type === "rule"
      ? formatRuleAsMarkdown(item)
      : formatAntiPatternAsMarkdown(item),
  );

  if (remaining.length > 0) {
    parts.push(
      `\n---\n### ${options.remainingHeader}\n` +
        formatRuleList(remaining.map((r) => r.item)),
    );
  }

  return {
    content: [{ type: "text", text: parts.join("\n\n---\n\n") }],
  };
}
