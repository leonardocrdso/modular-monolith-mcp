import { toPascalCase, toCamelCase } from "./utils.js";

export function generatePublicApi(moduleName: string): string {
  const pascal = toPascalCase(moduleName);
  const camel = toCamelCase(moduleName);

  return `// index.ts — Public API for the ${moduleName} module
// Rule: define-public-api — This file IS the module's contract
// Rule: hide-implementation-details — Only re-export what consumers need
// Rule: self-contained-initialization — Compose and export ready-to-use instances

import { ${pascal}Service } from "./${moduleName}.service.js";
import { Prisma${pascal}Repository } from "./${moduleName}.repository.js";
// Import your database client from shared kernel
// import { prisma } from "../../shared/prisma.js";

// --- Module Composition (internal wiring) ---
// Rule: self-contained-initialization
// const repository = new Prisma${pascal}Repository(prisma);
// export const ${camel}Service = new ${pascal}Service(repository);

// --- Public Types (the contract) ---
// Rule: dto-at-boundaries — Export only DTOs, never internal models
export type {
  ${pascal},
  Create${pascal}Input,
  Update${pascal}Input,
} from "./${moduleName}.types.js";

// --- Public Service (the behavior) ---
export { ${pascal}Service } from "./${moduleName}.service.js";

// --- NOT exported (implementation details) ---
// - ${pascal}Repository (internal data access)
// - Prisma${pascal}Repository (concrete implementation)
// - Validation schemas (used by routes within this module)
// - Internal helpers, mappers, constants
`;
}
