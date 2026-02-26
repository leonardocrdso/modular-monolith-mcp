import { toPascalCase, toCamelCase } from "./utils.js";

export function generateRouteHandler(moduleName: string): string {
  const pascal = toPascalCase(moduleName);
  const camel = toCamelCase(moduleName);
  const urlPath = moduleName;

  return `// ${moduleName}.routes.ts
// Rule: thin-routes — Validate input, call service, return response
// Rule: one-route-one-module — These routes belong exclusively to the ${moduleName} module
// Rule: request-validation-at-edge — Zod validation happens here, not in service

import { ${camel}Service } from "./index.js";
import {
  create${pascal}Schema,
  update${pascal}Schema,
  query${pascal}Schema,
} from "./${moduleName}.validation.js";

// Example using Express-style API. Adapt to your framework (Fastify, Hono, etc.)

// GET /${urlPath}
// List with pagination
export async function list${pascal}(req: any, res: any) {
  const query = query${pascal}Schema.parse(req.query);
  const items = await ${camel}Service.getAll();
  res.json(items);
}

// GET /${urlPath}/:id
// Get by ID
export async function get${pascal}(req: any, res: any) {
  const item = await ${camel}Service.getById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "${pascal} not found" });
  }
  res.json(item);
}

// POST /${urlPath}
// Create new
export async function create${pascal}(req: any, res: any) {
  const input = create${pascal}Schema.parse(req.body);
  const item = await ${camel}Service.create(input);
  res.status(201).json(item);
}

// PATCH /${urlPath}/:id
// Update existing
export async function update${pascal}(req: any, res: any) {
  const input = update${pascal}Schema.parse(req.body);
  const item = await ${camel}Service.update(req.params.id, input);
  res.json(item);
}

// DELETE /${urlPath}/:id
// Delete
export async function delete${pascal}(req: any, res: any) {
  await ${camel}Service.delete(req.params.id);
  res.status(204).end();
}

// Route registration helper
// export function register${pascal}Routes(app: any) {
//   app.get("/${urlPath}", list${pascal});
//   app.get("/${urlPath}/:id", get${pascal});
//   app.post("/${urlPath}", create${pascal});
//   app.patch("/${urlPath}/:id", update${pascal});
//   app.delete("/${urlPath}/:id", delete${pascal});
// }
`;
}
