import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, dirname } from "node:path";

interface ImportViolation {
  file: string;
  line: number;
  importPath: string;
  sourceModule: string;
  targetModule: string;
  reason: string;
}

async function walkDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "build") {
      files.push(...(await walkDir(fullPath)));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractModuleName(filePath: string, modulesDir: string): string | null {
  const rel = relative(modulesDir, filePath);
  if (rel.startsWith("..")) return null;
  const parts = rel.split("/");
  return parts.length >= 2 ? parts[0] : null;
}

function isInternalImport(importPath: string, targetModule: string): boolean {
  const parts = importPath.split("/");
  const moduleIdx = parts.indexOf(targetModule);
  if (moduleIdx === -1) return false;

  const afterModule = parts.slice(moduleIdx + 1);
  if (afterModule.length === 0) return false;
  if (afterModule.length === 1 && afterModule[0] === "index.js") return false;
  if (afterModule.length === 1 && afterModule[0] === "index.ts") return false;
  if (afterModule.length === 1 && afterModule[0] === "index") return false;
  if (afterModule.length === 1 && afterModule[0] === "") return false;

  return true;
}

export function registerCheckImportsTool(server: McpServer) {
  server.registerTool(
    "check-imports",
    {
      description:
        "Analyze imports across modules to detect boundary violations. " +
        "Scans TypeScript files for direct imports between modules that bypass the public API (index.ts). " +
        "Expects a modules directory containing module subdirectories.",
      inputSchema: {
        path: z
          .string()
          .describe(
            "Absolute path to the modules directory (e.g. '/project/src/modules')",
          ),
      },
    },
    async ({ path }) => {
      let allFiles: string[];
      try {
        allFiles = await walkDir(path);
      } catch {
        return {
          content: [
            {
              type: "text",
              text: `Could not read directory: ${path}\nMake sure the path exists and contains module directories.`,
            },
          ],
        };
      }

      const violations: ImportViolation[] = [];
      const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;

      for (const file of allFiles) {
        const sourceModule = extractModuleName(file, path);
        if (!sourceModule) continue;

        let content: string;
        try {
          content = await readFile(file, "utf-8");
        } catch {
          continue;
        }

        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let match: RegExpExecArray | null;
          importRegex.lastIndex = 0;

          while ((match = importRegex.exec(line)) !== null) {
            const importPath = match[1];

            if (!importPath.startsWith(".")) continue;

            const fileDir = dirname(file);

            const importModule = extractModuleName(
              join(fileDir, importPath),
              path,
            );

            if (!importModule || importModule === sourceModule) continue;

            if (isInternalImport(importPath, importModule)) {
              violations.push({
                file: relative(path, file),
                line: i + 1,
                importPath,
                sourceModule,
                targetModule: importModule,
                reason: "Direct import of internal file bypasses module boundary",
              });
            }
          }
        }
      }

      const resultLines: string[] = [
        `# Import Boundary Check`,
        "",
        `**Scanned:** ${allFiles.length} files in ${path}`,
        "",
      ];

      if (violations.length === 0) {
        resultLines.push(
          "## Result: No violations found",
          "",
          "All cross-module imports go through the public API (index.ts).",
        );
      } else {
        resultLines.push(
          `## Result: ${violations.length} violation(s) found`,
          "",
          "The following imports bypass module boundaries by importing internal files directly:",
          "",
        );

        const grouped = new Map<string, ImportViolation[]>();
        for (const v of violations) {
          const key = `${v.sourceModule} → ${v.targetModule}`;
          const list = grouped.get(key) ?? [];
          list.push(v);
          grouped.set(key, list);
        }

        for (const [pair, vs] of grouped) {
          resultLines.push(`### ${pair}`);
          for (const v of vs) {
            resultLines.push(
              `- \`${v.file}:${v.line}\` imports \`${v.importPath}\``,
            );
          }
          resultLines.push("");
        }

        resultLines.push(
          "## How to fix",
          "",
          "1. Each module should expose its public API via `index.ts`",
          "2. Change imports to use the module's `index.ts` barrel export",
          "3. If the needed export doesn't exist, add it to the target module's `index.ts`",
          "",
          "**Related rules:** `no-direct-module-imports`, `define-public-api`, `hide-implementation-details`",
        );
      }

      return {
        content: [{ type: "text", text: resultLines.join("\n") }],
      };
    },
  );
}
