import { toPascalCase } from "./utils.js";

export function generateRepository(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `// ${moduleName}.repository.ts
// Rule: separate-module-data — Only this module accesses its own data
// Rule: depend-on-abstractions — Export interface for DI and testing
// Rule: data-ownership-principle — This module owns the lifecycle of its data

import type { ${pascal}, Create${pascal}Input, Update${pascal}Input } from "./${moduleName}.types.js";

// Interface — used by service via dependency injection
export interface ${pascal}Repository {
  findById(id: string): Promise<${pascal} | null>;
  findAll(): Promise<${pascal}[]>;
  create(input: Create${pascal}Input): Promise<${pascal}>;
  update(id: string, input: Update${pascal}Input): Promise<${pascal}>;
  delete(id: string): Promise<void>;
}

// Implementation — Prisma example (swap for any data source)
// Rule: hide-implementation-details — Implementation is internal to this module
export class Prisma${pascal}Repository implements ${pascal}Repository {
  constructor(private readonly prisma: any) {}

  async findById(id: string): Promise<${pascal} | null> {
    return this.prisma.${moduleName.replace(/-/g, "")}.findUnique({ where: { id } });
  }

  async findAll(): Promise<${pascal}[]> {
    return this.prisma.${moduleName.replace(/-/g, "")}.findMany();
  }

  async create(input: Create${pascal}Input): Promise<${pascal}> {
    return this.prisma.${moduleName.replace(/-/g, "")}.create({ data: input });
  }

  async update(id: string, input: Update${pascal}Input): Promise<${pascal}> {
    return this.prisma.${moduleName.replace(/-/g, "")}.update({ where: { id }, data: input });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.${moduleName.replace(/-/g, "")}.delete({ where: { id } });
  }
}
`;
}
