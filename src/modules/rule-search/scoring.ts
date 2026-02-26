import type { RuleCategory } from "../../shared/categories.js";
import type { ArchitectureRule } from "../rule-catalog/index.js";

const SCORE_WEIGHTS = {
  EXACT_ID_MATCH: 100,
  NAME_CONTAINS: 80,
  TAG_EXACT: 70,
  TAG_PARTIAL: 50,
  DESCRIPTION_CONTAINS: 30,
  CATEGORY_MATCH: 20,
} as const;

const CATEGORY_BOOST_MULTIPLIER = 15;

export function scoreRuleByQuery(
  rule: ArchitectureRule,
  query: string,
): number {
  const normalizedQuery = query.toLowerCase().trim();
  let score = 0;

  if (rule.id === normalizedQuery) {
    return SCORE_WEIGHTS.EXACT_ID_MATCH;
  }

  if (rule.name.toLowerCase().includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.NAME_CONTAINS;
  }

  for (const tag of rule.tags) {
    if (tag === normalizedQuery) {
      score += SCORE_WEIGHTS.TAG_EXACT;
    } else if (
      tag.includes(normalizedQuery) ||
      normalizedQuery.includes(tag)
    ) {
      score += SCORE_WEIGHTS.TAG_PARTIAL;
    }
  }

  if (rule.description.toLowerCase().includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.DESCRIPTION_CONTAINS;
  }

  if (rule.category.includes(normalizedQuery)) {
    score += SCORE_WEIGHTS.CATEGORY_MATCH;
  }

  return score;
}

export function scoreRuleByTokens(
  rule: ArchitectureRule,
  tokens: string[],
  categoryBoosts: Map<RuleCategory, number>,
): number {
  let score = 0;
  for (const token of tokens) {
    score += scoreRuleByQuery(rule, token);
  }
  const boost = categoryBoosts.get(rule.category) ?? 0;
  score += boost * CATEGORY_BOOST_MULTIPLIER;
  return score;
}

export function rankRules<T extends ArchitectureRule>(
  rules: T[],
  scoreFn: (rule: T) => number,
): T[] {
  return rules
    .map((rule) => ({ rule, score: scoreFn(rule) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ rule }) => rule);
}
