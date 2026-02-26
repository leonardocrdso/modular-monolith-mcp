import { toPascalCase } from "./utils.js";

export function generateModuleScaffold(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `# Module Scaffold: ${moduleName}

## Directory Structure
\`\`\`
modules/${moduleName}/
  ${moduleName}.service.ts      — Business logic (rule: vertical-slice-per-module)
  ${moduleName}.repository.ts   — Data access layer (rule: separate-module-data)
  ${moduleName}.types.ts        — Domain types & interfaces (rule: dto-at-boundaries)
  ${moduleName}.validation.ts   — Zod input schemas (rule: request-validation-at-edge)
  ${moduleName}.routes.ts       — API route handlers (rule: thin-routes)
  index.ts                      — Public API barrel (rule: define-public-api)
\`\`\`

## File: index.ts (Public API)
\`\`\`typescript
// Rule: define-public-api — Only export what consumers need
// Rule: hide-implementation-details — Internals stay private
export { ${moduleName.replace(/-/g, "")}Service } from "./${moduleName}.service.js";
export type {
  ${pascal},
  Create${pascal}Input,
  Update${pascal}Input,
} from "./${moduleName}.types.js";
\`\`\`

## File: ${moduleName}.types.ts
\`\`\`typescript
// Rule: dto-at-boundaries — Public types are DTOs, not internal models
export interface ${pascal} {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Create${pascal}Input {
  // Define required fields for creation
}

export interface Update${pascal}Input {
  // Define optional fields for updates
}
\`\`\`

## File: ${moduleName}.service.ts
\`\`\`typescript
// Rule: vertical-slice-per-module — Service contains business logic
// Rule: self-contained-initialization — Dependencies injected via constructor
import type { ${pascal}, Create${pascal}Input } from "./${moduleName}.types.js";
import type { ${pascal}Repository } from "./${moduleName}.repository.js";

export class ${pascal}Service {
  constructor(private repository: ${pascal}Repository) {}

  async getById(id: string): Promise<${pascal} | null> {
    return this.repository.findById(id);
  }

  async create(input: Create${pascal}Input): Promise<${pascal}> {
    return this.repository.create(input);
  }
}
\`\`\`

## File: ${moduleName}.repository.ts
\`\`\`typescript
// Rule: separate-module-data — Only this module accesses its data
// Rule: depend-on-abstractions — Export interface, not just implementation
import type { ${pascal}, Create${pascal}Input } from "./${moduleName}.types.js";

export interface ${pascal}Repository {
  findById(id: string): Promise<${pascal} | null>;
  create(input: Create${pascal}Input): Promise<${pascal}>;
}
\`\`\`

## File: ${moduleName}.validation.ts
\`\`\`typescript
// Rule: request-validation-at-edge — Validate at the API boundary
import { z } from "zod";

export const create${pascal}Schema = z.object({
  // Define validation rules matching Create${pascal}Input
});

export const update${pascal}Schema = z.object({
  // Define validation rules matching Update${pascal}Input
});
\`\`\`

## File: ${moduleName}.routes.ts
\`\`\`typescript
// Rule: thin-routes — Validate, call service, respond
// Rule: one-route-one-module — Routes belong to this module only
import { ${moduleName.replace(/-/g, "")}Service } from "./index.js";
import { create${pascal}Schema } from "./${moduleName}.validation.js";

// Register routes with your framework (Express, Fastify, Hono, etc.)
// app.get("/${moduleName}/:id", async (req, res) => {
//   const item = await service.getById(req.params.id);
//   res.json(item);
// });
\`\`\`

## Architecture Compliance
- [x] Domain-centric organization (rule: domain-centric-modules)
- [x] Public API via index.ts (rule: define-public-api)
- [x] Data isolation (rule: separate-module-data)
- [x] Thin routes (rule: thin-routes)
- [x] Self-contained initialization (rule: self-contained-initialization)
`;
}
