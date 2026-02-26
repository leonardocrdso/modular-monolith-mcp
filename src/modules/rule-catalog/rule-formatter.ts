import { CATEGORY_LABELS, type RuleCategory } from "../../shared/categories.js";
import type { CodeExample, CleanCodeReference } from "../../shared/types.js";
import type { ArchitectureRule } from "./rules.js";
import type { AntiPattern } from "./anti-patterns.js";

export function formatRuleAsMarkdown(rule: ArchitectureRule): string {
  const lines: string[] = [
    `## ${rule.name}`,
    "",
    `**Category:** ${CATEGORY_LABELS[rule.category]}`,
    `**ID:** \`${rule.id}\``,
    "",
    rule.description,
    "",
    `**Rationale:** ${rule.rationale}`,
  ];

  if (rule.examples.length > 0) {
    lines.push("", "### Examples");
    for (const example of rule.examples) {
      lines.push(...formatExample(example));
    }
  }

  if (rule.cleanCodeRefs.length > 0) {
    lines.push("", "### Related Clean Code Principles");
    for (const ref of rule.cleanCodeRefs) {
      lines.push(...formatCleanCodeRef(ref));
    }
  }

  lines.push("", `**Tags:** ${rule.tags.join(", ")}`);

  if (rule.source) {
    lines.push(`**Source:** ${rule.source}`);
  }

  return lines.join("\n");
}

export function formatAntiPatternAsMarkdown(ap: AntiPattern): string {
  const lines: string[] = [
    `## ⚠ Anti-Pattern: ${ap.name}`,
    "",
    `**Category:** ${CATEGORY_LABELS[ap.category]}`,
    `**ID:** \`${ap.id}\``,
    "",
    ap.description,
  ];

  if (ap.examples.length > 0) {
    lines.push("", "### Examples");
    for (const example of ap.examples) {
      lines.push(...formatExample(example));
    }
  }

  if (ap.cleanCodeRefs.length > 0) {
    lines.push("", "### Related Clean Code Principles");
    for (const ref of ap.cleanCodeRefs) {
      lines.push(...formatCleanCodeRef(ref));
    }
  }

  lines.push("", `**Tags:** ${ap.tags.join(", ")}`);

  return lines.join("\n");
}

function formatExample(example: CodeExample): string[] {
  return [
    "",
    `**${example.label}:**`,
    "",
    `\`\`\`${example.language}`,
    example.code,
    "```",
  ];
}

function formatCleanCodeRef(ref: CleanCodeReference): string[] {
  return [
    `- **${ref.relationship}** \`${ref.principleId}\` — ${ref.note}`,
    `  _Use: search-principle "${ref.principleId}" in clean-code-mcp_`,
  ];
}

export function formatRuleList(
  rules: (ArchitectureRule | AntiPattern)[],
): string {
  if (rules.length === 0) {
    return "No rules found.";
  }

  const lines = [`Found **${rules.length}** rule(s):`, ""];

  for (const rule of rules) {
    lines.push(
      `- **${rule.name}** (\`${rule.id}\`) — ${truncateDescription(rule.description)}`,
    );
  }

  return lines.join("\n");
}

function truncateDescription(description: string, maxLength = 100): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength).trimEnd() + "...";
}

export function formatCatalogGrouped(rules: ArchitectureRule[]): string {
  const grouped = groupByCategory(rules);
  const lines: string[] = ["# Modular Monolith Architecture Rules Catalog", ""];

  for (const [category, categoryRules] of grouped) {
    lines.push(`## ${CATEGORY_LABELS[category]}`, "");
    for (const rule of categoryRules) {
      lines.push(`- **${rule.name}** (\`${rule.id}\`)`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function groupByCategory(
  rules: ArchitectureRule[],
): Map<RuleCategory, ArchitectureRule[]> {
  const grouped = new Map<RuleCategory, ArchitectureRule[]>();

  for (const rule of rules) {
    const list = grouped.get(rule.category) ?? [];
    list.push(rule);
    grouped.set(rule.category, list);
  }

  return grouped;
}
