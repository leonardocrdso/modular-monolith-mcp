import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { generateModuleScaffold } from "./module-scaffold.js";
import { generateService } from "./service.js";
import { generateRepository } from "./repository.js";
import { generateTypes } from "./types.js";
import { generateValidation } from "./validation.js";
import { generatePublicApi } from "./public-api.js";
import { generateRouteHandler } from "./route-handler.js";
import { generateIntegrationClient } from "./integration-client.js";

const TEMPLATE_NAMES = [
  "module-scaffold",
  "service",
  "repository",
  "types",
  "validation",
  "public-api",
  "route-handler",
  "integration-client",
] as const;

type TemplateName = (typeof TEMPLATE_NAMES)[number];

const TEMPLATE_GENERATORS: Record<TemplateName, (name: string) => string> = {
  "module-scaffold": generateModuleScaffold,
  service: generateService,
  repository: generateRepository,
  types: generateTypes,
  validation: generateValidation,
  "public-api": generatePublicApi,
  "route-handler": generateRouteHandler,
  "integration-client": generateIntegrationClient,
};

const MODULE_NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export function registerGetTemplateTool(server: McpServer) {
  server.registerTool(
    "get-template",
    {
      description:
        "Get a code template for scaffolding module files. " +
        "Returns ready-to-use TypeScript code with comments referencing architecture rules.",
      inputSchema: {
        template: z
          .enum(TEMPLATE_NAMES)
          .describe(
            `Template to generate. Options: ${TEMPLATE_NAMES.join(", ")}`,
          ),
        moduleName: z
          .string()
          .describe(
            "Name of the module in kebab-case (e.g. 'orders', 'user-management')",
          ),
      },
    },
    async ({ template, moduleName }) => {
      if (!MODULE_NAME_REGEX.test(moduleName)) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid module name "${moduleName}". Module names must be kebab-case: start with a lowercase letter, contain only lowercase letters, digits, and hyphens (e.g. 'orders', 'user-management').`,
            },
          ],
        };
      }

      const generator = TEMPLATE_GENERATORS[template];
      const code = generator(moduleName);

      return {
        content: [{ type: "text", text: code }],
      };
    },
  );
}
