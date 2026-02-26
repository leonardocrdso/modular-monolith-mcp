# @leonardocrdso/modular-monolith-mcp

An MCP (Model Context Protocol) server that provides 35 architecture rules, 16 anti-patterns, 3 decision trees, and 8 code templates for building Modular Monolith applications. Search, validate, and scaffold modules following best practices.

## Installation

### Using npx (recommended)

```bash
npx @leonardocrdso/modular-monolith-mcp
```

### Adding to Claude Code

```bash
claude mcp add modular-monolith-mcp -- npx @leonardocrdso/modular-monolith-mcp
```

### Manual configuration

Add to your MCP client settings:

```json
{
  "mcpServers": {
    "modular-monolith-mcp": {
      "command": "npx",
      "args": ["@leonardocrdso/modular-monolith-mcp"]
    }
  }
}
```

## Tools

### `search-rule`

Search architecture rules by name, keyword, or ID. Also searches anti-patterns.

```
query: "thin-routes"
query: "boundary"
query: "data-isolation"
```

### `search-by-context`

Find relevant rules for a given situation. Describe your problem in natural language.

```
context: "my modules are importing internal files from each other"
context: "I need to decide between sync and async communication"
```

### `list-rules`

List all rules or filter by category.

```
category: "module-boundaries"
category: "module-communication"
```

### `validate-module`

Validate a module directory structure against Modular Monolith conventions. Checks for required files (service, types, index.ts) and recommended files (repository, validation, routes).

```
path: "/project/src/modules/orders"
```

### `check-imports`

Analyze imports across modules to detect boundary violations. Finds direct imports that bypass public APIs (index.ts).

```
path: "/project/src/modules"
```

### `get-template`

Generate code templates for scaffolding module files. Returns ready-to-use TypeScript with architecture rule references.

```
template: "service"         moduleName: "orders"
template: "module-scaffold" moduleName: "user-management"
template: "repository"      moduleName: "payments"
```

Available templates: `module-scaffold`, `service`, `repository`, `types`, `validation`, `public-api`, `route-handler`, `integration-client`

## Resources

- **`modular://catalog`** — Full catalog of all 35 rules grouped by category
- **`modular://rule/{id}`** — Individual architecture rule by ID
- **`modular://anti-pattern/{id}`** — Individual anti-pattern by ID
- **`modular://decision-tree/{id}`** — Architectural decision tree by ID

## Prompts

### `architecture-review`

Generates a structured architecture review prompt with relevant Modular Monolith rules embedded as context.

Parameters:
- `code` (required) — The source code to review
- `language` (optional) — Programming language (e.g. `typescript`, `python`)
- `focus_categories` (optional) — Comma-separated categories to focus on

### `module-design`

Generates a prompt to help design a new module with proper structure, boundaries, and communication patterns.

Parameters:
- `module_name` (required) — Name of the module to design
- `description` (required) — Brief description of what this module does
- `responsibilities` (required) — Comma-separated list of responsibilities

## Categories

10 categories covering 35 rules and 16 anti-patterns:

| Category | Description |
|---|---|
| `module-structure` | Module Structure |
| `module-boundaries` | Module Boundaries |
| `module-communication` | Module Communication |
| `data-isolation` | Data Isolation |
| `dependency-management` | Dependency Management |
| `routes-and-controllers` | Routes & Controllers |
| `shared-kernel` | Shared Kernel |
| `testing-strategy` | Testing Strategy |
| `external-integrations` | External Integrations |
| `migration` | Migration & Evolution |

## Decision Trees

3 interactive decision trees for common architectural choices:

- **`create-vs-expand-module`** — Create a new module vs expand an existing one
- **`sync-vs-async-communication`** — Sync service calls vs async events
- **`when-to-extract-microservice`** — When to extract a module into a microservice

## Ecosystem

Use together with [@leonardocrdso/clean-code-mcp](https://www.npmjs.com/package/@leonardocrdso/clean-code-mcp) for complete code quality coverage — architecture rules (this server) + Clean Code principles (clean-code-mcp).

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build
```

## License

MIT
