import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readdir } from "node:fs/promises";
import { basename } from "node:path";

const REQUIRED_FILES = [
  { pattern: ".service.", label: "Service (business logic)", rule: "standard-module-layout" },
  { pattern: ".types.", label: "Types (domain models)", rule: "standard-module-layout" },
  { pattern: "index.", label: "Public API (index.ts barrel)", rule: "define-public-api" },
];

const RECOMMENDED_FILES = [
  { pattern: ".repository.", label: "Repository (data access)", rule: "vertical-slice-per-module" },
  { pattern: ".validation.", label: "Validation (input schemas)", rule: "request-validation-at-edge" },
  { pattern: ".routes.", label: "Routes (API layer)", rule: "thin-routes" },
];

const REQUIRED_WEIGHT = 70;
const RECOMMENDED_WEIGHT = 30;

export function registerValidateModuleTool(server: McpServer) {
  server.registerTool(
    "validate-module",
    {
      description:
        "Validate the structure of a module directory against Modular Monolith conventions. " +
        "Checks for required files (service, types, index.ts) and recommended files (repository, validation, routes).",
      inputSchema: {
        path: z
          .string()
          .describe(
            "Absolute path to the module directory (e.g. '/project/src/modules/orders')",
          ),
      },
    },
    async ({ path }) => {
      let files: string[];
      try {
        const entries = await readdir(path, { withFileTypes: true });
        files = entries.map((e) => e.name);
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Could not read directory: ${path}\nMake sure the path exists and is accessible.`,
            },
          ],
        };
      }

      const moduleName = basename(path);
      const lines: string[] = [
        `# Module Validation: \`${moduleName}\``,
        "",
        `**Path:** ${path}`,
        `**Files found:** ${files.length}`,
        "",
      ];

      let requiredCount = 0;
      lines.push("## Required Files");
      for (const req of REQUIRED_FILES) {
        const found = files.some((f) => f.includes(req.pattern));
        const icon = found ? "PASS" : "FAIL";
        if (found) requiredCount++;
        lines.push(`- [${icon}] ${req.label} — rule: \`${req.rule}\``);
      }

      let recommendedCount = 0;
      lines.push("", "## Recommended Files");
      for (const rec of RECOMMENDED_FILES) {
        const found = files.some((f) => f.includes(rec.pattern));
        const icon = found ? "PASS" : "MISSING";
        if (found) recommendedCount++;
        lines.push(`- [${icon}] ${rec.label} — rule: \`${rec.rule}\``);
      }

      const totalRequired = REQUIRED_FILES.length;
      const totalRecommended = RECOMMENDED_FILES.length;
      const score = Math.round(
        (requiredCount / totalRequired) * REQUIRED_WEIGHT +
          (recommendedCount / totalRecommended) * RECOMMENDED_WEIGHT,
      );

      lines.push(
        "",
        "## Summary",
        `- Required: ${requiredCount}/${totalRequired}`,
        `- Recommended: ${recommendedCount}/${totalRecommended}`,
        `- Compliance score: **${score}%**`,
      );

      if (requiredCount < totalRequired) {
        lines.push(
          "",
          "## Actions",
          "Missing required files indicate the module may not follow the standard layout.",
          "Use `get-template` to generate the missing files.",
        );
      }

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    },
  );
}
