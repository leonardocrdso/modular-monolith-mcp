import { toPascalCase } from "./utils.js";

export function generateService(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `// ${moduleName}.service.ts
// Rule: vertical-slice-per-module — Service contains all business logic for this module
// Rule: self-contained-initialization — Dependencies injected via constructor
// Rule: depend-on-abstractions — Depends on repository interface, not implementation

import type { ${pascal}, Create${pascal}Input, Update${pascal}Input } from "./${moduleName}.types.js";
import type { ${pascal}Repository } from "./${moduleName}.repository.js";

export class ${pascal}Service {
  constructor(private readonly repository: ${pascal}Repository) {}

  async getById(id: string): Promise<${pascal} | null> {
    return this.repository.findById(id);
  }

  async getAll(): Promise<${pascal}[]> {
    return this.repository.findAll();
  }

  async create(input: Create${pascal}Input): Promise<${pascal}> {
    // Add business rules and validations here
    return this.repository.create(input);
  }

  async update(id: string, input: Update${pascal}Input): Promise<${pascal}> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(\`${pascal} not found: \${id}\`);
    }
    // Add business rules for updates here
    return this.repository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(\`${pascal} not found: \${id}\`);
    }
    return this.repository.delete(id);
  }
}
`;
}
