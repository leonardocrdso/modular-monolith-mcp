import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RULES, findRuleById } from "./rules.js";
import { ANTI_PATTERNS, findAntiPatternById } from "./anti-patterns.js";
import { DECISION_TREES, findDecisionTreeById } from "./decision-trees.js";
import { CATEGORY_LABELS } from "../../shared/categories.js";

export function registerCatalogResources(server: McpServer) {
  registerStaticCatalog(server);
  registerRuleTemplate(server);
  registerAntiPatternTemplate(server);
  registerDecisionTreeTemplate(server);
}

function registerStaticCatalog(server: McpServer) {
  server.registerResource(
    "catalog",
    "modular://catalog",
    {
      description:
        "Full catalog of Modular Monolith architecture rules grouped by category",
    },
    async () => ({
      contents: [
        {
          uri: "modular://catalog",
          text: JSON.stringify(buildGroupedCatalog(), null, 2),
          mimeType: "application/json",
        },
      ],
    }),
  );
}

function registerRuleTemplate(server: McpServer) {
  server.registerResource(
    "rule",
    new ResourceTemplate("modular://rule/{id}", {
      list: async () => ({
        resources: RULES.map((rule) => ({
          uri: `modular://rule/${rule.id}`,
          name: rule.name,
          description: rule.description,
        })),
      }),
    }),
    { description: "Individual architecture rule by ID" },
    async (uri, { id }) => {
      const ruleId = Array.isArray(id) ? id[0] : id;
      const rule = findRuleById(ruleId);

      if (!rule) {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({ error: `Rule "${ruleId}" not found` }),
              mimeType: "application/json",
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(rule, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );
}

function registerAntiPatternTemplate(server: McpServer) {
  server.registerResource(
    "anti-pattern",
    new ResourceTemplate("modular://anti-pattern/{id}", {
      list: async () => ({
        resources: ANTI_PATTERNS.map((ap) => ({
          uri: `modular://anti-pattern/${ap.id}`,
          name: ap.name,
          description: ap.description,
        })),
      }),
    }),
    { description: "Individual anti-pattern by ID" },
    async (uri, { id }) => {
      const apId = Array.isArray(id) ? id[0] : id;
      const ap = findAntiPatternById(apId);

      if (!ap) {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({
                error: `Anti-pattern "${apId}" not found`,
              }),
              mimeType: "application/json",
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(ap, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );
}

function registerDecisionTreeTemplate(server: McpServer) {
  server.registerResource(
    "decision-tree",
    new ResourceTemplate("modular://decision-tree/{id}", {
      list: async () => ({
        resources: DECISION_TREES.map((tree) => ({
          uri: `modular://decision-tree/${tree.id}`,
          name: tree.name,
          description: tree.description,
        })),
      }),
    }),
    { description: "Architectural decision tree by ID" },
    async (uri, { id }) => {
      const treeId = Array.isArray(id) ? id[0] : id;
      const tree = findDecisionTreeById(treeId);

      if (!tree) {
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify({
                error: `Decision tree "${treeId}" not found`,
              }),
              mimeType: "application/json",
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(tree, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    },
  );
}

function buildGroupedCatalog(): Record<
  string,
  { id: string; name: string }[]
> {
  const grouped: Record<string, { id: string; name: string }[]> = {};

  for (const rule of RULES) {
    const label = CATEGORY_LABELS[rule.category];
    const list = grouped[label] ?? [];
    list.push({ id: rule.id, name: rule.name });
    grouped[label] = list;
  }

  return grouped;
}
