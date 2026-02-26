import { toPascalCase } from "./utils.js";

export function generateIntegrationClient(moduleName: string): string {
  const pascal = toPascalCase(moduleName);

  return `// ${moduleName}-client.ts
// Rule: dedicated-client-wrapper — Dedicated wrapper for the ${moduleName} external API
// Rule: isolated-integration-module — External API details stay within this module
// Rule: integration-change-isolation — Switching providers only affects this file

// --- Internal types (what YOUR code uses) ---
export interface ${pascal}Request {
  // Define your internal request shape
}

export interface ${pascal}Response {
  // Define your internal response shape
  // This is YOUR model, not the external API's model
}

// --- Client wrapper ---
export class ${pascal}Client {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: { baseUrl: string; apiKey: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async execute(request: ${pascal}Request): Promise<${pascal}Response> {
    // Rule: anti-corruption-layer — Translate internal model to external format
    const externalPayload = this.toExternalFormat(request);

    const response = await fetch(\`\${this.baseUrl}/endpoint\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${this.apiKey}\`,
      },
      body: JSON.stringify(externalPayload),
    });

    if (!response.ok) {
      throw new ${pascal}Error(
        \`${pascal} API error: \${response.status} \${response.statusText}\`,
      );
    }

    const externalResponse = await response.json();
    // Rule: anti-corruption-layer — Translate external response to internal model
    return this.toInternalFormat(externalResponse);
  }

  // --- Translation layer (Anti-Corruption Layer) ---
  private toExternalFormat(request: ${pascal}Request): unknown {
    // Map internal fields to external API format
    return {
      // external_field: request.internalField,
    };
  }

  private toInternalFormat(external: any): ${pascal}Response {
    // Map external API response to internal format
    return {
      // internalField: external.external_field,
    };
  }
}

// --- Error class ---
export class ${pascal}Error extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "${pascal}Error";
  }
}
`;
}
