import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RULES, formatRuleAsMarkdown } from "../rule-catalog/index.js";

const DESIGN_RELEVANT_CATEGORIES = [
  "module-structure",
  "module-boundaries",
  "module-communication",
  "data-isolation",
];

export function registerModuleDesignPrompt(server: McpServer) {
  server.registerPrompt(
    "module-design",
    {
      description:
        "Generate a prompt to help design a new module with proper structure, boundaries, and communication patterns.",
      argsSchema: {
        module_name: z
          .string()
          .describe(
            "Name of the module to design (e.g. 'orders', 'user-management')",
          ),
        description: z
          .string()
          .describe("Brief description of what this module does"),
        responsibilities: z
          .string()
          .describe(
            "Comma-separated list of the module's responsibilities (e.g. 'create orders, manage order status, calculate totals')",
          ),
      },
    },
    ({ module_name, description, responsibilities }) => {
      const relevantRules = RULES.filter((r) =>
        DESIGN_RELEVANT_CATEGORIES.includes(r.category),
      );

      const rulesReference = relevantRules
        .map(formatRuleAsMarkdown)
        .join("\n\n---\n\n");

      const responsibilityList = responsibilities
        .split(",")
        .map((r) => `- ${r.trim()}`)
        .join("\n");

      const prompt = `# Module Design: ${module_name}

## Module Description
${description}

## Responsibilities
${responsibilityList}

## Design Tasks

Please help design this module by addressing:

### 1. Structure
- What files should this module contain?
- Follow the standard module layout (rule: \`standard-module-layout\`)
- Ensure it's a proper vertical slice (rule: \`vertical-slice-per-module\`)

### 2. Public API
- What should the module's index.ts export?
- Define the DTOs that form the module's contract (rule: \`dto-at-boundaries\`)
- What should remain internal? (rule: \`hide-implementation-details\`)

### 3. Data Ownership
- What data does this module own? (rule: \`data-ownership-principle\`)
- What tables/collections will it need?
- Are there any data it needs from other modules? If so, how to access it? (rule: \`no-cross-module-joins\`)

### 4. Communication
- Which other modules will this module interact with?
- For each interaction: sync (service call) or async (events)? (rule: \`sync-via-service-interface\`, \`async-via-events\`)
- What events should this module emit?
- What events should this module listen to?

### 5. Dependencies
- Map the dependency graph — which modules does this one depend on?
- Ensure no circular dependencies (rule: \`acyclic-dependency-graph\`)
- Ensure dependency direction flows correctly (rule: \`dependency-direction\`)

## Architecture Rules Reference

${rulesReference}`;

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
