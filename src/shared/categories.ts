export const CATEGORIES = [
  "module-structure",
  "module-boundaries",
  "module-communication",
  "data-isolation",
  "dependency-management",
  "routes-and-controllers",
  "shared-kernel",
  "testing-strategy",
  "external-integrations",
  "migration",
] as const;

export type RuleCategory = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  "module-structure": "Module Structure",
  "module-boundaries": "Module Boundaries",
  "module-communication": "Module Communication",
  "data-isolation": "Data Isolation",
  "dependency-management": "Dependency Management",
  "routes-and-controllers": "Routes & Controllers",
  "shared-kernel": "Shared Kernel",
  "testing-strategy": "Testing Strategy",
  "external-integrations": "External Integrations",
  migration: "Migration & Evolution",
};

export function isValidCategory(value: string): value is RuleCategory {
  return CATEGORIES.includes(value as RuleCategory);
}
