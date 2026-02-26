import type { RuleCategory } from "../../shared/categories.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "it",
  "to",
  "in",
  "of",
  "and",
  "or",
  "for",
  "on",
  "at",
  "by",
  "be",
  "as",
  "do",
  "if",
  "my",
  "no",
  "not",
  "but",
  "was",
  "are",
  "has",
  "had",
  "can",
  "how",
  "what",
  "when",
  "this",
  "that",
  "with",
  "from",
  "have",
  "will",
  "been",
  "they",
  "them",
  "then",
  "than",
  "some",
  "should",
  "would",
  "could",
  "about",
  "which",
  "there",
  "where",
  "their",
  "other",
  "into",
  "very",
  "just",
  "also",
  "more",
  "like",
  "want",
  "need",
  "i",
  "me",
  "we",
  "you",
]);

const CATEGORY_KEYWORDS: Record<string, RuleCategory> = {
  module: "module-structure",
  modules: "module-structure",
  structure: "module-structure",
  layout: "module-structure",
  organize: "module-structure",
  organization: "module-structure",
  directory: "module-structure",
  folder: "module-structure",

  boundary: "module-boundaries",
  boundaries: "module-boundaries",
  api: "module-boundaries",
  facade: "module-boundaries",
  encapsulation: "module-boundaries",
  contract: "module-boundaries",
  public: "module-boundaries",
  barrel: "module-boundaries",

  communication: "module-communication",
  event: "module-communication",
  events: "module-communication",
  messaging: "module-communication",
  sync: "module-communication",
  async: "module-communication",
  "event-bus": "module-communication",

  data: "data-isolation",
  database: "data-isolation",
  schema: "data-isolation",
  isolation: "data-isolation",
  ownership: "data-isolation",
  table: "data-isolation",
  tables: "data-isolation",
  join: "data-isolation",
  prisma: "data-isolation",

  dependency: "dependency-management",
  dependencies: "dependency-management",
  coupling: "dependency-management",
  acyclic: "dependency-management",
  circular: "dependency-management",
  cycle: "dependency-management",
  dag: "dependency-management",

  route: "routes-and-controllers",
  routes: "routes-and-controllers",
  controller: "routes-and-controllers",
  handler: "routes-and-controllers",
  thin: "routes-and-controllers",
  endpoint: "routes-and-controllers",

  shared: "shared-kernel",
  kernel: "shared-kernel",
  common: "shared-kernel",
  duplication: "shared-kernel",

  test: "testing-strategy",
  testing: "testing-strategy",
  tests: "testing-strategy",
  mock: "testing-strategy",
  "contract-test": "testing-strategy",

  external: "external-integrations",
  client: "external-integrations",
  wrapper: "external-integrations",
  integration: "external-integrations",
  provider: "external-integrations",

  migration: "migration",
  strangler: "migration",
  extract: "migration",
  legacy: "migration",
  monolith: "migration",
  microservice: "migration",
  split: "migration",
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

export function removeStopWords(tokens: string[]): string[] {
  return tokens.filter((token) => !STOP_WORDS.has(token));
}

export function detectCategoryBoosts(
  tokens: string[],
): Map<RuleCategory, number> {
  const boosts = new Map<RuleCategory, number>();
  for (const token of tokens) {
    const category = CATEGORY_KEYWORDS[token];
    if (category) {
      const current = boosts.get(category) ?? 0;
      boosts.set(category, current + 1);
    }
  }
  return boosts;
}
