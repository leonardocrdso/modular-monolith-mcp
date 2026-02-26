import { toPascalCase } from "./utils.js";

export function generateTypes(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `// ${moduleName}.types.ts
// Rule: dto-at-boundaries — These types are the module's public contract
// Rule: stable-contracts — Changes here affect consumers; use additive changes

// Main entity DTO — returned by the module's public API
export interface ${pascal} {
  id: string;
  // Add domain-specific fields here
  createdAt: string;
  updatedAt: string;
}

// Input for creating a new entity
export interface Create${pascal}Input {
  // Add required fields for creation
  // Rule: Do NOT include id, createdAt, updatedAt — those are generated
}

// Input for updating an existing entity
export interface Update${pascal}Input {
  // All fields optional — partial updates
  // Rule: stable-contracts — New optional fields are backwards-compatible
}

// Lightweight reference type — for cross-module communication
// Rule: anti-corruption-layer — Other modules use this, not the full entity
export interface ${pascal}Reference {
  id: string;
  // Include only the minimal fields other modules need
}
`;
}
