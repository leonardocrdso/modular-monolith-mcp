#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListRulesTool, registerCatalogResources } from "./modules/rule-catalog/index.js";
import { registerSearchRuleTool, registerSearchByContextTool } from "./modules/rule-search/index.js";
import { registerValidateModuleTool, registerCheckImportsTool } from "./modules/module-validation/index.js";
import { registerGetTemplateTool } from "./modules/code-templates/index.js";
import { registerArchitectureReviewPrompt, registerModuleDesignPrompt } from "./modules/design-prompts/index.js";

const server = new McpServer({
  name: "modular-monolith-mcp",
  version: "1.0.0",
});

// Tools
registerSearchRuleTool(server);
registerSearchByContextTool(server);
registerListRulesTool(server);
registerValidateModuleTool(server);
registerCheckImportsTool(server);
registerGetTemplateTool(server);

// Resources
registerCatalogResources(server);

// Prompts
registerArchitectureReviewPrompt(server);
registerModuleDesignPrompt(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Modular Monolith MCP server running on stdio");
