import type { RuleCategory } from "../../shared/categories.js";
import type { CodeExample, CleanCodeReference } from "../../shared/types.js";

export interface AntiPattern {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  examples: CodeExample[];
  tags: string[];
  cleanCodeRefs: CleanCodeReference[];
}

export const ANTI_PATTERNS: AntiPattern[] = [
  {
    id: "shared-database-anti-pattern",
    name: "Shared Database",
    category: "data-isolation",
    description:
      "Multiple modules read from and write to the same database tables directly. This creates invisible coupling where schema changes in one module break others. Each module must own its data exclusively.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Orders module writes to users table directly
await prisma.user.update({
  where: { id: userId },
  data: { lastOrderAt: new Date() },
});`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Orders module asks users module to update
import { userService } from "../users/index.js";
await userService.recordLastOrder(userId);`,
      },
    ],
    tags: ["anti-pattern", "database", "shared", "coupling", "data"],
    cleanCodeRefs: [
      {
        principleId: "avoid-inappropriate-intimacy",
        relationship: "reinforces",
        note: "Shared database access is the deepest form of inappropriate intimacy",
      },
    ],
  },
  {
    id: "god-module",
    name: "God Module",
    category: "module-structure",
    description:
      "A single module that handles too many responsibilities with no clear boundary. It grows indefinitely because no one knows where else to put new code. Split by business domain.",
    examples: [
      {
        label: "Bad",
        language: "text",
        code: `modules/core/
  user.service.ts
  order.service.ts
  payment.service.ts
  notification.service.ts
  analytics.service.ts
  # Everything is in "core" — it's a monolith inside a monolith`,
      },
      {
        label: "Good",
        language: "text",
        code: `modules/
  users/         # Only user logic
  orders/        # Only order logic
  payments/      # Only payment logic
  notifications/ # Only notification logic`,
      },
    ],
    tags: ["anti-pattern", "god-module", "responsibility", "boundary", "split"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "reinforces",
        note: "A god module violates SRP at the module level — multiple reasons to change",
      },
      {
        principleId: "classes-should-be-small",
        relationship: "extends",
        note: "Just as classes should be small, modules should be focused",
      },
    ],
  },
  {
    id: "circular-dependency",
    name: "Circular Dependency",
    category: "dependency-management",
    description:
      "Module A depends on B, and B depends on A (directly or transitively). This makes both modules impossible to understand, test, or deploy independently. Break cycles with events or interfaces.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// modules/orders/order.service.ts
import { userService } from "../users/index.js";

// modules/users/user.service.ts
import { orderService } from "../orders/index.js";
// CIRCULAR: orders → users → orders`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Break cycle: orders depends on users, users uses events
// modules/orders/order.service.ts
import { userService } from "../users/index.js"; // OK

// modules/users/user.service.ts — no import from orders
eventBus.on("order.created", async ({ userId }) => {
  await userService.incrementOrderCount(userId);
});`,
      },
    ],
    tags: ["anti-pattern", "circular", "cycle", "dependency", "coupling"],
    cleanCodeRefs: [
      {
        principleId: "dependency-inversion-principle",
        relationship: "implements",
        note: "Break cycles by introducing abstractions (interfaces or events)",
      },
    ],
  },
  {
    id: "business-logic-in-routes",
    name: "Business Logic in Routes",
    category: "routes-and-controllers",
    description:
      "Route handlers contain business logic, database queries, and complex transformations instead of delegating to a service. Makes logic untestable and unreusable.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `app.post("/orders", async (req, res) => {
  const items = req.body.items;
  let total = 0;
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.id } });
    if (!product || product.stock < item.qty) {
      return res.status(400).json({ error: "Out of stock" });
    }
    total += product.price * item.qty;
  }
  const order = await prisma.order.create({ data: { total, items, userId: req.userId } });
  await prisma.product.updateMany({ /* decrement stock */ });
  res.json(order);
});`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `app.post("/orders", async (req, res) => {
  const input = createOrderSchema.parse(req.body);
  const order = await orderService.create(input);
  res.status(201).json(order);
});`,
      },
    ],
    tags: ["anti-pattern", "route", "business-logic", "fat-controller"],
    cleanCodeRefs: [
      {
        principleId: "do-one-thing",
        relationship: "reinforces",
        note: "Routes should do one thing: bridge HTTP to the service layer",
      },
      {
        principleId: "keep-functions-small",
        relationship: "reinforces",
        note: "Fat routes are long functions — extract to service",
      },
    ],
  },
  {
    id: "leaky-abstraction",
    name: "Leaky Abstraction",
    category: "module-boundaries",
    description:
      "Module's public API leaks internal implementation details: Prisma models, internal error types, database column names, or infrastructure types. The public API should expose only domain concepts.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Public API leaks Prisma types
export async function getUser(id: string): Promise<PrismaUser> {
  return prisma.user.findUniqueOrThrow({ where: { id } });
}
// Consumers now depend on Prisma — internal detail`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

export async function getUser(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? { id: user.id, email: user.email, name: user.name } : null;
}`,
      },
    ],
    tags: ["anti-pattern", "leaky", "abstraction", "boundary", "implementation"],
    cleanCodeRefs: [
      {
        principleId: "data-abstraction",
        relationship: "reinforces",
        note: "Proper abstraction hides implementation — leaky abstractions expose it",
      },
    ],
  },
  {
    id: "cross-module-direct-import",
    name: "Cross-Module Direct Import",
    category: "module-communication",
    description:
      "Importing internal files from another module instead of using its public API (index.ts). This bypasses the module boundary and creates tight coupling to implementation details.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Importing internal file directly
import { OrderRepository } from "../orders/order.repository.js";
import { hashPassword } from "../users/internal/crypto.js";
import { ORDER_STATUS } from "../orders/constants.js";`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Import only from public API
import { orderService, type Order, OrderStatus } from "../orders/index.js";`,
      },
    ],
    tags: ["anti-pattern", "import", "direct", "boundary", "violation"],
    cleanCodeRefs: [
      {
        principleId: "law-of-demeter",
        relationship: "reinforces",
        note: "Don't reach into another module's internals",
      },
    ],
  },
  {
    id: "cross-module-db-access",
    name: "Cross-Module DB Access",
    category: "data-isolation",
    description:
      "One module directly queries or modifies another module's database tables. Even read-only access is a violation because it couples to the schema.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Shipping module directly queries orders table
const orders = await prisma.order.findMany({
  where: { status: "ready_to_ship" },
});`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Shipping asks orders module for the data
const orders = await orderService.getReadyToShip();`,
      },
    ],
    tags: ["anti-pattern", "database", "cross-module", "query", "access"],
    cleanCodeRefs: [
      {
        principleId: "avoid-inappropriate-intimacy",
        relationship: "reinforces",
        note: "Direct DB access is intimate knowledge of another module's data structure",
      },
    ],
  },
  {
    id: "distributed-monolith",
    name: "Distributed Monolith",
    category: "module-communication",
    description:
      "Modules are 'separated' in directories but completely coupled: synchronous calls everywhere, shared database, no clear boundaries. Worst of both worlds: complexity of distribution with rigidity of monolith.",
    examples: [
      {
        label: "Bad",
        language: "text",
        code: `modules/
  orders/    → imports from users, payments, inventory, shipping
  users/     → imports from orders, payments
  payments/  → imports from orders, users
  # Every module depends on every other module
  # Can't change anything without affecting everything`,
      },
      {
        label: "Good",
        language: "text",
        code: `modules/
  orders/    → depends on: users (read), emits: order.created
  users/     → depends on: nothing, listens: order.created
  payments/  → depends on: orders (read), emits: payment.completed
  # Clear dependency direction, minimal coupling`,
      },
    ],
    tags: ["anti-pattern", "distributed-monolith", "coupling", "separation"],
    cleanCodeRefs: [
      {
        principleId: "high-cohesion",
        relationship: "reinforces",
        note: "Distributed monolith has low cohesion within modules and high coupling between them",
      },
    ],
  },
  {
    id: "anemic-module",
    name: "Anemic Module",
    category: "module-structure",
    description:
      "A module with no real business logic — it's just a pass-through that delegates everything to another module or the database. If a module adds no value, it shouldn't exist.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Anemic module: just passes through to prisma
export class UserService {
  async getById(id: string) { return prisma.user.findUnique({ where: { id } }); }
  async create(data: any) { return prisma.user.create({ data }); }
  async update(id: string, data: any) { return prisma.user.update({ where: { id }, data }); }
  // No validation, no business rules, no transformation
}`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `export class UserService {
  async create(input: CreateUserInput) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) throw new DuplicateEmailError(input.email);

    const hashedPassword = await hash(input.password);
    const user = await this.repo.create({ ...input, password: hashedPassword });

    eventBus.emit("user.created", { userId: user.id });
    return toUserDTO(user);
  }
}`,
      },
    ],
    tags: ["anti-pattern", "anemic", "pass-through", "no-logic", "crud"],
    cleanCodeRefs: [
      {
        principleId: "avoid-feature-envy",
        relationship: "extends",
        note: "An anemic module envies no one — it has no behavior of its own",
      },
    ],
  },
  {
    id: "feature-envy-module",
    name: "Feature Envy Module",
    category: "module-structure",
    description:
      "A module that uses more data and behavior from another module than from its own. This suggests the logic belongs in the other module, or the boundary is drawn incorrectly.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Shipping module uses mostly order data
export class ShippingService {
  async createShipment(orderId: string) {
    const order = await orderService.getById(orderId);
    const items = await orderService.getItems(orderId);
    const address = await orderService.getShippingAddress(orderId);
    const weight = await orderService.calculateWeight(orderId);
    // All data comes from orders — does shipping add any value?
  }
}`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Orders module provides a shipping-ready DTO
// modules/orders/index.ts
export interface ShippableOrder {
  orderId: string;
  items: ShippableItem[];
  destination: Address;
  totalWeightGrams: number;
}
export async function getShippableOrder(id: string): Promise<ShippableOrder>;

// Shipping module uses the focused DTO
const shippable = await orderService.getShippableOrder(orderId);
const rate = this.calculateRate(shippable.totalWeightGrams, shippable.destination);`,
      },
    ],
    tags: ["anti-pattern", "feature-envy", "boundary", "misplaced-logic"],
    cleanCodeRefs: [
      {
        principleId: "avoid-feature-envy",
        relationship: "extends",
        note: "Module-level feature envy: a module that envies another module's data",
      },
    ],
  },
  {
    id: "premature-extraction",
    name: "Premature Extraction",
    category: "migration",
    description:
      "Extracting code into a module before understanding the real boundaries. Premature modules often have the wrong boundaries and need to be merged or restructured later.",
    examples: [
      {
        label: "Bad",
        language: "text",
        code: `Day 1 of project:
"Let's create 12 modules based on our initial design"
→ By month 2, half need to be merged or split
→ Wasted effort on wrong boundaries`,
      },
      {
        label: "Good",
        language: "text",
        code: `Start simple, extract when patterns emerge:
1. Keep related code close
2. Notice which code changes together
3. When a clear boundary appears, extract to module
4. The boundary is right when changes are isolated`,
      },
    ],
    tags: ["anti-pattern", "premature", "extraction", "boundary", "early"],
    cleanCodeRefs: [
      {
        principleId: "simple-design-minimal",
        relationship: "reinforces",
        note: "Don't add structure you don't need yet — minimal classes, minimal modules",
      },
    ],
  },
  {
    id: "shared-everything-kernel",
    name: "Shared Everything Kernel",
    category: "shared-kernel",
    description:
      "A shared kernel that contains implementations, utilities, helpers, and business logic instead of just types and infrastructure. Becomes a coupling magnet that every module depends on.",
    examples: [
      {
        label: "Bad",
        language: "text",
        code: `shared/
  utils/
    date-utils.ts        # Business logic in shared
    price-calculator.ts  # Should be in orders
    email-validator.ts   # Should be in each module
    formatters.ts        # Each module should format its own data
  services/
    base-service.ts      # God base class`,
      },
      {
        label: "Good",
        language: "text",
        code: `shared/
  prisma.ts      # Infrastructure: DB client
  event-bus.ts   # Infrastructure: event system
  logger.ts      # Infrastructure: logging
  types.ts       # Types only: Paginated<T>, Result<T>
  errors.ts      # Base error classes`,
      },
    ],
    tags: ["anti-pattern", "shared-kernel", "coupling", "utility", "implementation"],
    cleanCodeRefs: [
      {
        principleId: "interface-segregation-principle",
        relationship: "reinforces",
        note: "Share only minimal interfaces, not broad implementations",
      },
    ],
  },
  {
    id: "event-soup",
    name: "Event Soup",
    category: "module-communication",
    description:
      "Too many events without clear naming, documentation, or traceability. When everything communicates via events, it becomes impossible to understand the flow. Use events for decoupling, not for everything.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// 50+ events with no documentation or naming convention
eventBus.emit("data_changed", { ... });
eventBus.emit("update", { type: "user", ... });
eventBus.emit("action", { action: "purchase", ... });
// Who listens? What happens? Nobody knows`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Clear naming: {module}.{entity}.{action}
eventBus.emit("orders.order.created", {
  orderId: "123",
  userId: "456",
  totalCents: 5000,
});
// Documented, typed, traceable`,
      },
    ],
    tags: ["anti-pattern", "events", "soup", "naming", "traceability"],
    cleanCodeRefs: [
      {
        principleId: "use-intention-revealing-names",
        relationship: "reinforces",
        note: "Event names should clearly reveal what happened",
      },
    ],
  },
  {
    id: "tight-temporal-coupling",
    name: "Tight Temporal Coupling",
    category: "module-communication",
    description:
      "Modules that depend on a specific execution order: module A must initialize before B, or operation X must complete before Y. This creates fragile, hard-to-debug systems.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Modules must initialize in specific order
await userModule.init();      // Must be first
await orderModule.init();     // Depends on users being ready
await paymentModule.init();   // Depends on orders being ready
// Swap the order → runtime crash`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Modules initialize independently
await Promise.all([
  userModule.init(),
  orderModule.init(),
  paymentModule.init(),
]);
// Each module handles its own readiness`,
      },
    ],
    tags: ["anti-pattern", "temporal", "coupling", "order", "initialization"],
    cleanCodeRefs: [
      {
        principleId: "avoid-side-effects-in-functions",
        relationship: "reinforces",
        note: "Temporal coupling often comes from hidden side effects during initialization",
      },
    ],
  },
  {
    id: "hidden-dependency",
    name: "Hidden Dependency",
    category: "dependency-management",
    description:
      "Modules depend on each other through global state, environment variables, or shared singletons instead of explicit imports. These invisible dependencies make the system unpredictable.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Hidden dependency via global state
// modules/orders/order.service.ts
export class OrderService {
  async create(input: CreateOrderInput) {
    // Depends on global.currentUser being set by auth middleware
    const userId = (global as any).currentUser.id;
    // Hidden: nothing in the import graph shows this dependency
  }
}`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Explicit dependency via parameter
export class OrderService {
  async create(input: CreateOrderInput, userId: string) {
    // Dependency is explicit in the function signature
  }
}`,
      },
    ],
    tags: ["anti-pattern", "hidden", "dependency", "global", "state", "implicit"],
    cleanCodeRefs: [
      {
        principleId: "avoid-side-effects-in-functions",
        relationship: "reinforces",
        note: "Global state access is a hidden side effect",
      },
      {
        principleId: "use-dependency-injection",
        relationship: "reinforces",
        note: "Explicit DI makes all dependencies visible",
      },
    ],
  },
  {
    id: "inconsistent-boundaries",
    name: "Inconsistent Boundaries",
    category: "module-boundaries",
    description:
      "Some parts of a module have clear boundaries (public API, DTOs) while others leak internals. Partial boundaries are worse than none because they create false confidence.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// modules/orders/index.ts
export { orderService } from "./order.service.js";
export type { OrderDTO } from "./order.types.js";

// But also exports internals:
export { OrderRepository } from "./order.repository.js";
export { mapToDTO } from "./internal/mappers.js";
// Boundary exists but is not enforced`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/index.ts — Clean, consistent boundary
export { orderService } from "./order.service.js";
export type { OrderDTO, CreateOrderInput } from "./order.types.js";
// Nothing else exported — boundary is clear and enforced`,
      },
    ],
    tags: ["anti-pattern", "boundary", "inconsistent", "partial", "leaky"],
    cleanCodeRefs: [
      {
        principleId: "simple-design-expressive",
        relationship: "reinforces",
        note: "A clean boundary clearly expresses what the module provides",
      },
    ],
  },
];

export function findAntiPatternById(id: string): AntiPattern | undefined {
  return ANTI_PATTERNS.find((ap) => ap.id === id);
}

export function filterAntiPatternsByCategory(category: string): AntiPattern[] {
  return ANTI_PATTERNS.filter((ap) => ap.category === category);
}
