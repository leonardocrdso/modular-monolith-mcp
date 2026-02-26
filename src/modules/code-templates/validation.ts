import { toPascalCase } from "./utils.js";

export function generateValidation(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `// ${moduleName}.validation.ts
// Rule: request-validation-at-edge — Validate input at the API boundary
// Rule: one-route-one-module — Validation schemas belong to the module

import { z } from "zod";

// Schema for creating a new ${pascal}
export const create${pascal}Schema = z.object({
  // Define validation rules matching Create${pascal}Input
  // Example:
  // name: z.string().min(1).max(255),
  // email: z.string().email(),
});

// Schema for updating an existing ${pascal}
export const update${pascal}Schema = z.object({
  // All fields optional for partial updates
  // Example:
  // name: z.string().min(1).max(255).optional(),
  // email: z.string().email().optional(),
});

// Schema for query parameters / filters
export const query${pascal}Schema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  // Add module-specific filters
});

// Infer types from schemas — keeps validation and types in sync
export type Create${pascal}Validated = z.infer<typeof create${pascal}Schema>;
export type Update${pascal}Validated = z.infer<typeof update${pascal}Schema>;
export type Query${pascal}Params = z.infer<typeof query${pascal}Schema>;
`;
}
