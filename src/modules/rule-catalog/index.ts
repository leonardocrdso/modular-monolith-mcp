export {
  RULES,
  findRuleById,
  filterByCategory,
  type ArchitectureRule,
} from "./rules.js";

export {
  ANTI_PATTERNS,
  findAntiPatternById,
  filterAntiPatternsByCategory,
  type AntiPattern,
} from "./anti-patterns.js";

export {
  DECISION_TREES,
  findDecisionTreeById,
  type DecisionTree,
  type DecisionNode,
} from "./decision-trees.js";

export {
  formatRuleAsMarkdown,
  formatAntiPatternAsMarkdown,
  formatRuleList,
  formatCatalogGrouped,
} from "./rule-formatter.js";

export { registerListRulesTool } from "./list-rules.tool.js";
export { registerCatalogResources } from "./catalog.resource.js";
