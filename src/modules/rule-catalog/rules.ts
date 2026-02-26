import type { RuleCategory } from "../../shared/categories.js";
import type { CodeExample, CleanCodeReference } from "../../shared/types.js";

export interface ArchitectureRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  rationale: string;
  examples: CodeExample[];
  tags: string[];
  cleanCodeRefs: CleanCodeReference[];
  source?: string;
}

export const RULES: ArchitectureRule[] = [
  // ──────────────────────────────────────
  // module-structure (4)
  // ──────────────────────────────────────
  {
    id: "domain-centric-modules",
    name: "Domain-Centric Modules",
    category: "module-structure",
    description:
      "Organize modules around business domains, not technical layers. Each module represents a cohesive business capability (e.g. `orders/`, `payments/`, `users/`), not a layer (e.g. `controllers/`, `services/`, `repositories/`).",
    rationale:
      "Domain-centric organization aligns code structure with business understanding. When a business requirement changes, all related code lives in one place instead of being scattered across layers.",
    examples: [
      {
        label: "Bad",
        language: "text",
        code: `src/
  controllers/
    orderController.ts
    userController.ts
  services/
    orderService.ts
    userService.ts
  repositories/
    orderRepository.ts
    userRepository.ts`,
      },
      {
        label: "Good",
        language: "text",
        code: `src/
  modules/
    orders/
      order.service.ts
      order.repository.ts
      order.types.ts
      index.ts
    users/
      user.service.ts
      user.repository.ts
      user.types.ts
      index.ts`,
      },
    ],
    tags: ["module", "structure", "domain", "organization", "vertical-slice"],
    cleanCodeRefs: [
      {
        principleId: "high-cohesion",
        relationship: "reinforces",
        note: "Domain-centric modules keep related code together, maximizing cohesion",
      },
      {
        principleId: "organize-for-change",
        relationship: "extends",
        note: "Business changes affect a single module instead of multiple layers",
      },
    ],
    source: "Kamil Grzybek — Modular Monolith",
  },
  {
    id: "vertical-slice-per-module",
    name: "Vertical Slice per Module",
    category: "module-structure",
    description:
      "Each module should contain all layers needed to fulfill its responsibility: API routes, services, repositories, types, and validation. A module is a self-contained vertical slice through the architecture.",
    rationale:
      "Vertical slices minimize cross-cutting changes. Adding a feature means working within one module directory rather than editing files across the entire project.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `modules/orders/
  order.routes.ts       # API layer
  order.service.ts      # Business logic
  order.repository.ts   # Data access
  order.types.ts        # Domain types
  order.validation.ts   # Input validation
  index.ts              # Public API`,
      },
      {
        label: "Bad",
        language: "text",
        code: `# Module split across layers - no vertical slice
routes/orders.ts
services/orders.ts
models/orders.ts
# Changes to "orders" require touching 3+ directories`,
      },
    ],
    tags: ["module", "vertical-slice", "structure", "layers", "self-contained"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "implements",
        note: "Each module has a single business responsibility with all needed layers",
      },
    ],
    source: "Jimmy Bogard — Vertical Slice Architecture",
  },
  {
    id: "standard-module-layout",
    name: "Standard Module Layout",
    category: "module-structure",
    description:
      "Every module follows a predictable layout with standard files: service (business logic), repository (data access), types (domain models), validation (input schemas), and index.ts (public API). Consistency across modules reduces cognitive load.",
    rationale:
      "A standard layout means developers know exactly where to find things in any module. New modules are quick to scaffold and review because the structure is familiar.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Standard module layout - every module follows this
// modules/{name}/
//   {name}.service.ts     — Business logic
//   {name}.repository.ts  — Data access
//   {name}.types.ts       — Domain types & interfaces
//   {name}.validation.ts  — Zod schemas for input
//   {name}.routes.ts      — API routes (if applicable)
//   index.ts              — Public API barrel export`,
      },
      {
        label: "Bad",
        language: "text",
        code: `# Inconsistent layouts across modules
modules/orders/
  handlers.ts
  db.ts
  helpers.ts
modules/users/
  userService.ts
  userModel.ts
  utils/
    validate.ts`,
      },
    ],
    tags: ["module", "layout", "convention", "standard", "consistency"],
    cleanCodeRefs: [
      {
        principleId: "pick-one-word-per-concept",
        relationship: "extends",
        note: "Consistent naming across modules — same file names, same patterns",
      },
    ],
  },
  {
    id: "self-contained-initialization",
    name: "Self-Contained Initialization",
    category: "module-structure",
    description:
      "Each module handles its own composition and initialization. Services are wired together within the module, not by an external bootstrapper. The module's index.ts creates and exports ready-to-use instances.",
    rationale:
      "Self-contained initialization means a module can be understood, tested, and replaced without understanding the global setup. It reduces coupling to the application's bootstrap phase.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/index.ts
import { OrderService } from "./order.service.js";
import { OrderRepository } from "./order.repository.js";
import { prisma } from "../../shared/prisma.js";

const orderRepository = new OrderRepository(prisma);
export const orderService = new OrderService(orderRepository);

// Public types
export type { Order, CreateOrderInput } from "./order.types.js";`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// app-bootstrap.ts — Centralizes ALL module wiring
import { OrderService } from "./modules/orders/order.service.js";
import { OrderRepository } from "./modules/orders/order.repository.js";
import { UserService } from "./modules/users/user.service.js";
// ...dozens more imports from module internals

const orderRepo = new OrderRepository(prisma);
const orderService = new OrderService(orderRepo);
// Every module's internals exposed to the bootstrapper`,
      },
    ],
    tags: ["module", "initialization", "composition", "self-contained", "bootstrap"],
    cleanCodeRefs: [
      {
        principleId: "separate-construction-from-use",
        relationship: "implements",
        note: "Module separates object construction (index.ts) from use (consumers import the public API)",
      },
      {
        principleId: "use-dependency-injection",
        relationship: "reinforces",
        note: "Dependencies are injected within the module's composition root",
      },
    ],
  },

  // ──────────────────────────────────────
  // module-boundaries (4)
  // ──────────────────────────────────────
  {
    id: "define-public-api",
    name: "Define Public API",
    category: "module-boundaries",
    description:
      "Every module must expose its public API through an index.ts barrel file. Only types, functions, and instances exported from index.ts are part of the module's contract. Everything else is an implementation detail.",
    rationale:
      "A well-defined public API is the foundation of module boundaries. It makes the contract explicit, enables independent evolution of internals, and prevents accidental coupling.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/index.ts — The module's public contract
export { orderService } from "./order.service.js";
export type { Order, CreateOrderInput } from "./order.types.js";
export type { OrderService } from "./order.service.js";

// NOT exported: OrderRepository, internal helpers, DB schemas`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// No index.ts — consumers import directly from internals
import { OrderRepository } from "../orders/order.repository.js";
import { mapOrderToDTO } from "../orders/internal/mappers.js";`,
      },
    ],
    tags: ["boundary", "public-api", "barrel", "index", "contract", "encapsulation"],
    cleanCodeRefs: [
      {
        principleId: "data-abstraction",
        relationship: "reinforces",
        note: "Public API abstracts module internals — consumers see the interface, not the implementation",
      },
      {
        principleId: "interface-segregation-principle",
        relationship: "implements",
        note: "Module exposes only what consumers need, not everything it contains",
      },
    ],
    source: "Kamil Grzybek — Modular Monolith",
  },
  {
    id: "hide-implementation-details",
    name: "Hide Implementation Details",
    category: "module-boundaries",
    description:
      "Module internals (repositories, mappers, helpers, database schemas) must never be imported directly by other modules. Only the public API surface (index.ts exports) is accessible.",
    rationale:
      "Hiding implementation details allows modules to refactor freely without breaking consumers. It enforces loose coupling at the architectural level.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Direct import of another module's internal file
import { OrderRepository } from "../orders/order.repository.js";
import { hashPassword } from "../users/internal/crypto.js";`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Import only from the module's public API
import { orderService } from "../orders/index.js";
import type { Order } from "../orders/index.js";`,
      },
    ],
    tags: ["boundary", "encapsulation", "implementation", "hiding", "internal"],
    cleanCodeRefs: [
      {
        principleId: "law-of-demeter",
        relationship: "extends",
        note: "Don't reach into another module's internals — talk to its public API",
      },
      {
        principleId: "avoid-inappropriate-intimacy",
        relationship: "reinforces",
        note: "Modules should not know each other's internal structure",
      },
    ],
  },
  {
    id: "dto-at-boundaries",
    name: "DTOs at Boundaries",
    category: "module-boundaries",
    description:
      "Use Data Transfer Objects (DTOs) at module boundaries. Never pass internal entities or database models across module boundaries. DTOs represent the contract; internal models can change freely.",
    rationale:
      "DTOs decouple the module's internal model from its public contract. Internal schema changes don't break consumers as long as the DTO remains stable.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Exposing Prisma model directly
export function getOrder(id: string): Promise<PrismaOrder> {
  return prisma.order.findUnique({ where: { id } });
}`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Return a DTO, not the internal model
export interface OrderDTO {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
}

export async function getOrder(id: string): Promise<OrderDTO | null> {
  const order = await prisma.order.findUnique({ where: { id } });
  return order ? toOrderDTO(order) : null;
}`,
      },
    ],
    tags: ["boundary", "dto", "contract", "decoupling", "data-transfer"],
    cleanCodeRefs: [
      {
        principleId: "data-transfer-objects",
        relationship: "reinforces",
        note: "DTOs are the right tool for transferring data across module boundaries",
      },
    ],
  },
  {
    id: "stable-contracts",
    name: "Stable Contracts",
    category: "module-boundaries",
    description:
      "Public module contracts (exported types, function signatures) should be stable. Changes to public APIs require versioning or migration strategies. Breaking changes are communicated explicitly.",
    rationale:
      "Stable contracts allow modules to evolve independently. When a contract must change, explicit versioning prevents silent breakage across the codebase.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Additive change — backwards compatible
export interface OrderDTO {
  id: string;
  status: string;
  totalCents: number;
  // New field with optional to avoid breaking consumers
  currency?: string;
}`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Breaking change — renamed field without migration
export interface OrderDTO {
  id: string;
  status: string;
  // Was: totalCents, now: amountInCents — breaks all consumers
  amountInCents: number;
}`,
      },
    ],
    tags: ["boundary", "contract", "stability", "versioning", "backwards-compatible"],
    cleanCodeRefs: [
      {
        principleId: "open-closed-principle",
        relationship: "implements",
        note: "Module contracts are open for extension (new fields) but closed for modification (no breaking changes)",
      },
    ],
  },

  // ──────────────────────────────────────
  // module-communication (4)
  // ──────────────────────────────────────
  {
    id: "no-direct-module-imports",
    name: "No Direct Module Imports",
    category: "module-communication",
    description:
      "Modules NEVER import directly from another module's internal files. All cross-module communication goes through the public API (index.ts). This is the most fundamental boundary rule.",
    rationale:
      "Direct imports create tight coupling. When module A imports module B's internal file, any refactoring in B can break A. Public APIs provide a stable interface.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// VIOLATION: importing internal file from another module
import { OrderRepository } from "../orders/order.repository.js";
import { calculateTotal } from "../orders/helpers/pricing.js";`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Correct: import from the module's public API only
import { orderService, type Order } from "../orders/index.js";

const order = await orderService.getById(orderId);`,
      },
    ],
    tags: ["communication", "import", "boundary", "coupling", "direct-import"],
    cleanCodeRefs: [
      {
        principleId: "avoid-inappropriate-intimacy",
        relationship: "implements",
        note: "Direct imports are the most common form of inappropriate intimacy between modules",
      },
      {
        principleId: "dependency-inversion-principle",
        relationship: "reinforces",
        note: "Depend on the module's public interface, not its concrete internals",
      },
    ],
  },
  {
    id: "sync-via-service-interface",
    name: "Sync via Service Interface",
    category: "module-communication",
    description:
      "When module A needs data from module B synchronously, it calls B's exposed service interface. The service is exported from B's index.ts and used directly. This is appropriate for queries and reads.",
    rationale:
      "Service interfaces provide a clear, typed contract for synchronous communication. They're simple, traceable, and suitable for read operations where immediate response is needed.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/shipping/shipping.service.ts
import { orderService } from "../orders/index.js";

export class ShippingService {
  async calculateShipping(orderId: string) {
    // Sync call through order module's public API
    const order = await orderService.getById(orderId);
    return this.computeRate(order.totalCents, order.address);
  }
}`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// WRONG: querying another module's database directly
import { prisma } from "../../shared/prisma.js";

export class ShippingService {
  async calculateShipping(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    return this.computeRate(order.totalCents, order.address);
  }
}`,
      },
    ],
    tags: ["communication", "sync", "service", "interface", "query"],
    cleanCodeRefs: [
      {
        principleId: "law-of-demeter",
        relationship: "reinforces",
        note: "Talk to the service interface, don't reach through to the database",
      },
    ],
  },
  {
    id: "async-via-events",
    name: "Async via Events",
    category: "module-communication",
    description:
      "For operations where module A needs to notify module B without waiting for a response, use an internal event bus. Events are fire-and-forget and enable loose coupling between modules.",
    rationale:
      "Events decouple the sender from the receiver. Module A doesn't need to know who listens. This is ideal for side effects: sending emails, updating caches, triggering workflows.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/order.service.ts
import { eventBus } from "../../shared/event-bus.js";

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const order = await this.repository.create(input);

    // Notify other modules without direct dependency
    eventBus.emit("order.created", {
      orderId: order.id,
      userId: order.userId,
      totalCents: order.totalCents,
    });

    return order;
  }
}

// modules/notifications/notification.listener.ts
eventBus.on("order.created", async (event) => {
  await sendOrderConfirmationEmail(event.userId, event.orderId);
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// WRONG: direct call creates coupling
import { notificationService } from "../notifications/index.js";
import { analyticsService } from "../analytics/index.js";
import { inventoryService } from "../inventory/index.js";

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const order = await this.repository.create(input);
    // Order module "knows" about all these modules
    await notificationService.sendConfirmation(order);
    await analyticsService.trackPurchase(order);
    await inventoryService.decrementStock(order);
    return order;
  }
}`,
      },
    ],
    tags: ["communication", "async", "events", "event-bus", "fire-and-forget", "decoupling"],
    cleanCodeRefs: [
      {
        principleId: "open-closed-principle",
        relationship: "implements",
        note: "New listeners can be added without modifying the emitting module",
      },
      {
        principleId: "single-responsibility-principle",
        relationship: "reinforces",
        note: "The order module's job is to create orders, not to manage all side effects",
      },
    ],
  },
  {
    id: "anti-corruption-layer",
    name: "Anti-Corruption Layer",
    category: "module-communication",
    description:
      "When integrating with another module or external system whose model differs from yours, introduce an Anti-Corruption Layer (ACL) that translates between the foreign model and your internal model.",
    rationale:
      "An ACL prevents foreign concepts from leaking into your module. If the external model changes, only the ACL needs updating — your business logic stays clean.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/shipping/acl/order-translator.ts
import type { Order } from "../../orders/index.js";
import type { ShippableItem } from "../shipping.types.js";

// Translates the orders module's model to shipping's model
export function toShippableItem(order: Order): ShippableItem {
  return {
    reference: order.id,
    weightGrams: order.items.reduce((sum, i) => sum + i.weight, 0),
    destination: order.shippingAddress,
  };
}`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Shipping logic uses Order types directly — foreign model leaks in
export class ShippingService {
  async ship(order: Order) {
    // Using order.items[0].product.category — deep coupling
    if (order.items[0].product.category === "fragile") {
      // Shipping knows about product categories
    }
  }
}`,
      },
    ],
    tags: ["communication", "acl", "anti-corruption", "translation", "adapter"],
    cleanCodeRefs: [
      {
        principleId: "data-abstraction",
        relationship: "implements",
        note: "ACL abstracts the foreign model, exposing only what the module needs",
      },
    ],
    source: "Eric Evans — Domain-Driven Design",
  },

  // ──────────────────────────────────────
  // data-isolation (4)
  // ──────────────────────────────────────
  {
    id: "separate-module-data",
    name: "Separate Module Data",
    category: "data-isolation",
    description:
      "Each module owns its data. No other module may read or write another module's database tables, collections, or storage directly. Cross-module data access goes through the owning module's service.",
    rationale:
      "Data ownership is the strongest boundary. When modules share data directly, any schema change can cascade through the system. Service-mediated access provides a stable interface.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Shipping module directly queries orders table
const order = await prisma.order.findUnique({ where: { id: orderId } });`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Shipping module asks orders module for the data
import { orderService } from "../orders/index.js";
const order = await orderService.getById(orderId);`,
      },
    ],
    tags: ["data", "isolation", "ownership", "database", "separation"],
    cleanCodeRefs: [
      {
        principleId: "avoid-inappropriate-intimacy",
        relationship: "extends",
        note: "Data-level intimacy is the deepest form — modules must not access each other's data stores",
      },
    ],
    source: "Sam Newman — Building Microservices",
  },
  {
    id: "no-cross-module-joins",
    name: "No Cross-Module Joins",
    category: "data-isolation",
    description:
      "Never perform database JOINs across tables owned by different modules. If you need combined data, query each module's service separately and join in application code.",
    rationale:
      "Cross-module JOINs create invisible coupling at the database level. They break if either module's schema changes and make future module extraction nearly impossible.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// SQL JOIN across module boundaries
const result = await prisma.$queryRaw\`
  SELECT o.*, u.email
  FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE o.status = 'pending'
\`;`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Query each module separately, join in code
const pendingOrders = await orderService.getByStatus("pending");
const userIds = [...new Set(pendingOrders.map(o => o.userId))];
const users = await userService.getByIds(userIds);

const enriched = pendingOrders.map(order => ({
  ...order,
  userEmail: users.find(u => u.id === order.userId)?.email,
}));`,
      },
    ],
    tags: ["data", "join", "query", "cross-module", "database", "isolation"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "reinforces",
        note: "Each module manages its own data access — no shared queries",
      },
    ],
  },
  {
    id: "logical-schema-separation",
    name: "Logical Schema Separation",
    category: "data-isolation",
    description:
      "In a monolith with a single database (e.g., Prisma), use logical separation to indicate which module owns which tables. Use naming conventions, schema comments, or separate Prisma schema files per module.",
    rationale:
      "Even with a shared database, logical ownership makes it clear who is responsible for what. This prepares the system for future extraction if needed.",
    examples: [
      {
        label: "Good",
        language: "prisma",
        code: `// schema.prisma — Logical separation with comments
// === MODULE: orders ===
model Order {
  id        String   @id @default(uuid())
  status    String
  totalCents Int
  userId    String   // FK reference, not a Prisma relation
  createdAt DateTime @default(now())
}

// === MODULE: users ===
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
}`,
      },
      {
        label: "Bad",
        language: "prisma",
        code: `// No ownership indication — who owns what?
model Order {
  id     String @id
  user   User   @relation(fields: [userId], references: [id])
  userId String
}
model User {
  id     String  @id
  orders Order[] // Bidirectional relation crosses module boundary
}`,
      },
    ],
    tags: ["data", "schema", "prisma", "logical-separation", "naming"],
    cleanCodeRefs: [
      {
        principleId: "use-intention-revealing-names",
        relationship: "reinforces",
        note: "Schema comments and naming conventions reveal data ownership",
      },
    ],
  },
  {
    id: "data-ownership-principle",
    name: "Data Ownership Principle",
    category: "data-isolation",
    description:
      "The module that creates the data is responsible for its entire lifecycle: creation, reads, updates, deletion, and validation. Other modules request operations through the owning module's service.",
    rationale:
      "Clear ownership prevents conflicting writes, inconsistent validation, and orphaned data. One module is the source of truth for each piece of data.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Only the users module can create/update/delete users
// modules/users/user.service.ts
export class UserService {
  async create(input: CreateUserInput): Promise<UserDTO> { /* ... */ }
  async update(id: string, input: UpdateUserInput): Promise<UserDTO> { /* ... */ }
  async deactivate(id: string): Promise<void> { /* ... */ }
}

// Other modules call the service — never write to user tables directly`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Admin module directly updates user table
// modules/admin/admin.service.ts
async deactivateUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { active: false },
  });
}`,
      },
    ],
    tags: ["data", "ownership", "lifecycle", "crud", "source-of-truth"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "reinforces",
        note: "One module responsible for each data entity's lifecycle",
      },
    ],
  },

  // ──────────────────────────────────────
  // dependency-management (3)
  // ──────────────────────────────────────
  {
    id: "acyclic-dependency-graph",
    name: "Acyclic Dependency Graph",
    category: "dependency-management",
    description:
      "The module dependency graph must be a Directed Acyclic Graph (DAG). No circular dependencies between modules. If A depends on B, B must never depend on A (directly or transitively).",
    rationale:
      "Circular dependencies make modules impossible to understand, test, or extract independently. They indicate unclear boundaries that need redesigning.",
    examples: [
      {
        label: "Bad",
        language: "typescript",
        code: `// Circular: orders → users → orders
// modules/orders/order.service.ts
import { userService } from "../users/index.js";

// modules/users/user.service.ts
import { orderService } from "../orders/index.js"; // CYCLE!`,
      },
      {
        label: "Good",
        language: "typescript",
        code: `// Break cycle with events or a shared interface
// modules/orders/order.service.ts
import { userService } from "../users/index.js"; // OK: one direction

// modules/users/user.service.ts
// Does NOT import from orders. Uses events instead:
eventBus.on("order.created", async ({ userId }) => {
  await userService.incrementOrderCount(userId);
});`,
      },
    ],
    tags: ["dependency", "acyclic", "dag", "circular", "graph", "cycle"],
    cleanCodeRefs: [
      {
        principleId: "dependency-inversion-principle",
        relationship: "implements",
        note: "Break cycles by depending on abstractions (interfaces/events) instead of concrete modules",
      },
    ],
    source: "Robert C. Martin — Clean Architecture",
  },
  {
    id: "depend-on-abstractions",
    name: "Depend on Abstractions",
    category: "dependency-management",
    description:
      "Modules should depend on interfaces and types, not concrete implementations. When a module needs capability from another module, depend on the exported interface, not the concrete class.",
    rationale:
      "Depending on abstractions allows swapping implementations without changing consumers. It enables testing with mocks and reduces coupling between modules.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/order.types.ts
export interface PaymentGateway {
  charge(amount: number, currency: string): Promise<PaymentResult>;
}

// modules/orders/order.service.ts
export class OrderService {
  constructor(private payment: PaymentGateway) {}
}

// modules/payments/index.ts exports the implementation
export const paymentGateway: PaymentGateway = new StripePayment();`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Direct dependency on concrete class
import { StripePayment } from "../payments/stripe-payment.js";

export class OrderService {
  private payment = new StripePayment(); // Tight coupling
}`,
      },
    ],
    tags: ["dependency", "abstraction", "interface", "coupling", "inversion"],
    cleanCodeRefs: [
      {
        principleId: "dependency-inversion-principle",
        relationship: "reinforces",
        note: "High-level modules should not depend on low-level modules — both depend on abstractions",
      },
      {
        principleId: "open-closed-principle",
        relationship: "complements",
        note: "Abstraction-based deps allow extending behavior without modifying the consumer",
      },
    ],
  },
  {
    id: "dependency-direction",
    name: "Dependency Direction",
    category: "dependency-management",
    description:
      "Dependencies should flow in one direction: infrastructure → application → domain. Higher-level modules (domain) should never depend on lower-level modules (infrastructure).",
    rationale:
      "Unidirectional dependency flow makes the system predictable. Domain logic stays pure and testable, free from infrastructure concerns.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `Dependency flow:
  Routes (infra) → Service (app) → Types/Interfaces (domain)
  Repository (infra) → implements → RepositoryInterface (domain)

Domain layer has ZERO external dependencies.`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Domain type depending on infrastructure
import { PrismaClient } from "@prisma/client"; // WRONG in domain layer

export interface Order {
  prismaModel: PrismaClient; // Infrastructure leaking into domain
}`,
      },
    ],
    tags: ["dependency", "direction", "flow", "layers", "domain", "infrastructure"],
    cleanCodeRefs: [
      {
        principleId: "separate-construction-from-use",
        relationship: "complements",
        note: "Infrastructure is constructed and injected — domain uses abstractions",
      },
    ],
    source: "Robert C. Martin — Clean Architecture",
  },

  // ──────────────────────────────────────
  // routes-and-controllers (3)
  // ──────────────────────────────────────
  {
    id: "thin-routes",
    name: "Thin Routes",
    category: "routes-and-controllers",
    description:
      "Route handlers should be thin: validate input, call the service, return response. No business logic, no direct database access, no complex transformations in the route.",
    rationale:
      "Thin routes keep the API layer as a simple adapter. Business logic in services is reusable and testable; business logic in routes is neither.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Thin route: validate → call service → respond
app.post("/orders", async (req, res) => {
  const input = createOrderSchema.parse(req.body);
  const order = await orderService.create(input);
  res.status(201).json(order);
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Fat route: business logic inside the handler
app.post("/orders", async (req, res) => {
  const { items, userId } = req.body;
  // Business logic that belongs in service:
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (total > 10000) {
    await sendHighValueAlert(userId);
  }
  const order = await prisma.order.create({
    data: { items, userId, total, status: "pending" },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { lastOrderAt: new Date() },
  });
  res.json(order);
});`,
      },
    ],
    tags: ["route", "controller", "thin", "handler", "api", "validation"],
    cleanCodeRefs: [
      {
        principleId: "do-one-thing",
        relationship: "implements",
        note: "A thin route does one thing: bridge HTTP to the service layer",
      },
      {
        principleId: "keep-functions-small",
        relationship: "reinforces",
        note: "Routes stay small when business logic lives in services",
      },
    ],
  },
  {
    id: "one-route-one-module",
    name: "One Route, One Module",
    category: "routes-and-controllers",
    description:
      "Each route belongs to exactly one module. A route file lives within its module directory and only calls that module's service. Cross-module operations are handled by the service, not the route.",
    rationale:
      "When routes belong to one module, the API surface is clear. It prevents routes from becoming orchestrators that couple multiple modules together.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/order.routes.ts
// Only calls orderService — belongs to orders module
app.get("/orders/:id", async (req, res) => {
  const order = await orderService.getById(req.params.id);
  res.json(order);
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Route importing from multiple modules directly
import { orderService } from "../orders/index.js";
import { userService } from "../users/index.js";
import { paymentService } from "../payments/index.js";

app.post("/checkout", async (req, res) => {
  const user = await userService.getById(req.body.userId);
  const order = await orderService.create(req.body);
  await paymentService.charge(order.totalCents);
  res.json({ order });
});
// This "checkout" route belongs to no specific module`,
      },
    ],
    tags: ["route", "module", "ownership", "api", "single"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "implements",
        note: "Each route file has one reason to change — its owning module's requirements",
      },
    ],
  },
  {
    id: "request-validation-at-edge",
    name: "Request Validation at Edge",
    category: "routes-and-controllers",
    description:
      "Validate request input at the route/controller level (the edge), not deep inside services. Use Zod schemas or similar to validate and parse input before passing it to the service.",
    rationale:
      "Validating at the edge means services receive trusted, typed data. It separates HTTP concerns (parsing, validation) from business logic (processing).",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Validation at the edge with Zod
import { createOrderSchema } from "./order.validation.js";

app.post("/orders", async (req, res) => {
  const input = createOrderSchema.parse(req.body); // Validated & typed
  const order = await orderService.create(input);   // Service trusts input
  res.status(201).json(order);
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Validation buried inside the service
export class OrderService {
  async create(rawBody: unknown) {
    if (!rawBody || typeof rawBody !== "object") throw new Error("Invalid");
    const { items } = rawBody as any;
    if (!Array.isArray(items)) throw new Error("Items required");
    // Mixing validation with business logic
  }
}`,
      },
    ],
    tags: ["route", "validation", "edge", "zod", "input", "parsing"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "reinforces",
        note: "Routes validate input; services handle business logic",
      },
      {
        principleId: "prefer-exceptions-to-error-codes",
        relationship: "complements",
        note: "Zod throws on invalid input — clean exception-based validation",
      },
    ],
  },

  // ──────────────────────────────────────
  // shared-kernel (3)
  // ──────────────────────────────────────
  {
    id: "minimal-shared-code",
    name: "Minimal Shared Code",
    category: "shared-kernel",
    description:
      "The shared kernel (code used by multiple modules) should be minimal and extremely stable. Limit it to: logger, database client, event bus, base types, and configuration. Nothing else.",
    rationale:
      "Every piece of shared code is a coupling point. The more you share, the harder it is to change anything. A minimal kernel means minimal coupling.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `shared/
  prisma.ts       # Database client instance
  event-bus.ts    # Internal event bus
  logger.ts       # Application logger
  errors.ts       # Base error classes
  types.ts        # Truly shared types (Pagination, Result)`,
      },
      {
        label: "Bad",
        language: "text",
        code: `shared/
  prisma.ts
  logger.ts
  email-sender.ts       # Should be in notifications module
  price-calculator.ts   # Should be in orders module
  date-utils.ts         # Should be duplicated or in a lib
  api-client.ts         # Should be in integrations module
  validators/           # Each module should own its validation`,
      },
    ],
    tags: ["shared", "kernel", "minimal", "coupling", "common"],
    cleanCodeRefs: [
      {
        principleId: "classes-should-be-small",
        relationship: "extends",
        note: "Like classes, the shared kernel should be small — only the essentials",
      },
    ],
    source: "Eric Evans — Domain-Driven Design",
  },
  {
    id: "prefer-duplication-over-coupling",
    name: "Prefer Duplication over Coupling",
    category: "shared-kernel",
    description:
      "When two modules need similar code, prefer duplicating it in each module rather than extracting it to shared. Coupling between modules is more expensive than local duplication.",
    rationale:
      "Duplication is a local problem; coupling is a global problem. Two modules with similar validation code can evolve independently. Shared code forces them to change in lockstep.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/orders/order.validation.ts
const emailSchema = z.string().email();

// modules/users/user.validation.ts
const emailSchema = z.string().email();
// Same code, but each module can evolve independently`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// shared/validators.ts — Forces coupling
export const emailSchema = z.string().email().min(5);
// Change here breaks BOTH orders and users
// What if orders needs .min(3) but users needs .min(5)?`,
      },
    ],
    tags: ["shared", "duplication", "coupling", "dry", "independence"],
    cleanCodeRefs: [
      {
        principleId: "dry-principle",
        relationship: "complements",
        note: "DRY applies within a module. Across modules, controlled duplication is preferred over coupling",
      },
    ],
    source: "Sandi Metz — The Wrong Abstraction",
  },
  {
    id: "shared-types-only",
    name: "Shared Types Only",
    category: "shared-kernel",
    description:
      "The shared kernel should contain only types, interfaces, and constants — never implementations. If you need shared behavior, use dependency injection or events instead of shared code.",
    rationale:
      "Types are the safest thing to share because they have no behavior. Shared implementations create coupling and make it hard to reason about which module controls which behavior.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// shared/types.ts — Types only, no implementation
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Result<T, E = Error> {
  ok: boolean;
  data?: T;
  error?: E;
}`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// shared/pagination.ts — Implementation in shared kernel
export function paginate<T>(items: T[], page: number, size: number): Paginated<T> {
  const start = (page - 1) * size;
  return {
    items: items.slice(start, start + size),
    total: items.length,
    page,
    pageSize: size,
  };
}`,
      },
    ],
    tags: ["shared", "types", "interface", "implementation", "kernel"],
    cleanCodeRefs: [
      {
        principleId: "interface-segregation-principle",
        relationship: "reinforces",
        note: "Share only the minimal interface needed — types are inherently segregated",
      },
    ],
  },

  // ──────────────────────────────────────
  // testing-strategy (3)
  // ──────────────────────────────────────
  {
    id: "test-module-in-isolation",
    name: "Test Module in Isolation",
    category: "testing-strategy",
    description:
      "Each module should be testable independently. Unit tests for a module should not require other modules to be running or initialized. Mock external dependencies.",
    rationale:
      "Isolated tests are fast, reliable, and pinpoint failures precisely. If testing one module requires another, the modules are too coupled.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Test order service in isolation
describe("OrderService", () => {
  const mockRepo = { create: vi.fn(), getById: vi.fn() };
  const service = new OrderService(mockRepo);

  it("creates an order", async () => {
    mockRepo.create.mockResolvedValue({ id: "1", status: "pending" });
    const result = await service.create({ items: [], userId: "u1" });
    expect(result.status).toBe("pending");
  });
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Test requires REAL database and other modules
describe("OrderService", () => {
  it("creates an order", async () => {
    // Needs real user in database
    await prisma.user.create({ data: { id: "u1", email: "a@b.com" } });
    // Needs payment module running
    const result = await orderService.create({ items: [], userId: "u1" });
  });
});`,
      },
    ],
    tags: ["testing", "isolation", "unit-test", "mock", "independent"],
    cleanCodeRefs: [
      {
        principleId: "independent-tests",
        relationship: "extends",
        note: "Module-level isolation ensures tests are independent of other modules",
      },
      {
        principleId: "fast-tests",
        relationship: "reinforces",
        note: "Isolated module tests with mocks run fast",
      },
    ],
  },
  {
    id: "contract-tests-at-boundaries",
    name: "Contract Tests at Boundaries",
    category: "testing-strategy",
    description:
      "Test the module's public API (contract) rather than its internal implementation. Tests should exercise the exported functions and verify the expected DTOs.",
    rationale:
      "Contract tests survive refactoring. If you test internals, every refactoring breaks tests. Contract tests verify what matters: the module delivers what it promises.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Test the public API contract
import { orderService, type OrderDTO } from "../orders/index.js";

describe("Orders module contract", () => {
  it("getById returns OrderDTO shape", async () => {
    const order = await orderService.getById("test-id");
    expect(order).toMatchObject({
      id: expect.any(String),
      status: expect.any(String),
      totalCents: expect.any(Number),
    });
  });
});`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Testing internal implementation details
import { OrderRepository } from "../orders/order.repository.js";
import { mapToDTO } from "../orders/internal/mappers.js";

describe("Order internals", () => {
  it("maps entity to DTO correctly", () => {
    // This test breaks if you rename the mapper
  });
});`,
      },
    ],
    tags: ["testing", "contract", "boundary", "public-api", "integration"],
    cleanCodeRefs: [
      {
        principleId: "test-boundary-conditions",
        relationship: "extends",
        note: "Module boundaries are the most critical boundary conditions to test",
      },
    ],
  },
  {
    id: "mock-other-modules",
    name: "Mock Other Modules",
    category: "testing-strategy",
    description:
      "When testing a module that depends on another module, mock the dependency at the module boundary (its public API). Never mock internal classes of another module.",
    rationale:
      "Mocking at module boundaries keeps tests focused on the module under test. It verifies integration contracts without requiring the full dependency chain.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Mock the orders module's public API
vi.mock("../orders/index.js", () => ({
  orderService: {
    getById: vi.fn().mockResolvedValue({
      id: "1",
      status: "paid",
      totalCents: 5000,
    }),
  },
}));

// Now test shipping module with mocked orders
describe("ShippingService", () => { /* ... */ });`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Mocking internal implementation of another module
vi.mock("../orders/order.repository.js", () => ({ /* ... */ }));
vi.mock("../orders/internal/pricing.js", () => ({ /* ... */ }));
// Breaks when orders module refactors its internals`,
      },
    ],
    tags: ["testing", "mock", "module", "boundary", "dependency"],
    cleanCodeRefs: [
      {
        principleId: "independent-tests",
        relationship: "reinforces",
        note: "Mocking at module boundaries keeps tests independent",
      },
    ],
  },

  // ──────────────────────────────────────
  // external-integrations (3)
  // ──────────────────────────────────────
  {
    id: "isolated-integration-module",
    name: "Isolated Integration Module",
    category: "external-integrations",
    description:
      "Each external integration (Stripe, SendGrid, S3, etc.) should live in its own module or within the consuming module behind a client wrapper. External API details must not leak into business logic.",
    rationale:
      "Isolating integrations means switching providers or updating API versions only affects one module. Business logic stays clean of external API specifics.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `modules/
  payments/
    stripe-client.ts     # Stripe-specific implementation
    payment.service.ts   # Business logic uses PaymentGateway interface
    payment.types.ts     # PaymentGateway interface definition
    index.ts`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Stripe details scattered across modules
// modules/orders/order.service.ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_KEY);

export class OrderService {
  async checkout(orderId: string) {
    // Stripe API details in order business logic
    const intent = await stripe.paymentIntents.create({ ... });
  }
}`,
      },
    ],
    tags: ["integration", "external", "isolation", "module", "provider"],
    cleanCodeRefs: [
      {
        principleId: "single-responsibility-principle",
        relationship: "implements",
        note: "Integration module's sole responsibility is wrapping the external API",
      },
      {
        principleId: "separate-construction-from-use",
        relationship: "reinforces",
        note: "External client is constructed in the integration module, consumed through its interface",
      },
    ],
  },
  {
    id: "dedicated-client-wrapper",
    name: "Dedicated Client Wrapper",
    category: "external-integrations",
    description:
      "Create a dedicated client wrapper for each external API. The wrapper translates between the external API's model and your internal model, handles authentication, retries, and error mapping.",
    rationale:
      "A client wrapper is your Anti-Corruption Layer for external systems. It provides a stable internal interface even when the external API changes.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// modules/notifications/email-client.ts
export class EmailClient {
  constructor(private apiKey: string) {}

  async send(params: SendEmailParams): Promise<EmailResult> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { Authorization: \`Bearer \${this.apiKey}\` },
        body: JSON.stringify(this.toSendGridFormat(params)),
      });
      return this.parseResponse(response);
    } catch (error) {
      throw new EmailSendError("Failed to send email", { cause: error });
    }
  }

  private toSendGridFormat(params: SendEmailParams) { /* ... */ }
  private parseResponse(response: Response): EmailResult { /* ... */ }
}`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Direct API calls scattered throughout services
export class OrderService {
  async notifyUser(email: string, orderId: string) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      headers: { Authorization: \`Bearer \${process.env.SENDGRID_KEY}\` },
      body: JSON.stringify({ /* SendGrid-specific format */ }),
    });
  }
}`,
      },
    ],
    tags: ["integration", "client", "wrapper", "api", "external", "adapter"],
    cleanCodeRefs: [
      {
        principleId: "data-abstraction",
        relationship: "implements",
        note: "The wrapper abstracts the external API behind a clean internal interface",
      },
      {
        principleId: "use-exceptions-not-return-codes",
        relationship: "complements",
        note: "Client wrapper translates HTTP errors to meaningful exceptions",
      },
    ],
  },
  {
    id: "integration-change-isolation",
    name: "Integration Change Isolation",
    category: "external-integrations",
    description:
      "When an external system changes (new API version, provider switch), only the integration module should need to change. No business logic or other modules should be affected.",
    rationale:
      "This is the payoff of proper integration isolation. Switching from SendGrid to Mailgun or upgrading Stripe API v1 to v2 becomes a localized change.",
    examples: [
      {
        label: "Good",
        language: "typescript",
        code: `// Switching from Stripe to PayPal — only payment module changes
// modules/payments/paypal-client.ts (new)
export class PayPalClient implements PaymentGateway {
  async charge(amount: number, currency: string): Promise<PaymentResult> {
    // PayPal-specific implementation
  }
}

// modules/payments/index.ts — swap the implementation
export const paymentGateway: PaymentGateway = new PayPalClient();
// All consumers still use PaymentGateway interface — zero changes needed`,
      },
      {
        label: "Bad",
        language: "typescript",
        code: `// Switching payment provider requires changing every consumer
// Must update: orders, subscriptions, invoices, refunds...
// Because they all import Stripe directly`,
      },
    ],
    tags: ["integration", "change", "isolation", "provider", "swap"],
    cleanCodeRefs: [
      {
        principleId: "open-closed-principle",
        relationship: "implements",
        note: "System is open to new integrations but closed for modification of existing business logic",
      },
    ],
  },

  // ──────────────────────────────────────
  // migration (4)
  // ──────────────────────────────────────
  {
    id: "strangler-fig-pattern",
    name: "Strangler Fig Pattern",
    category: "migration",
    description:
      "Migrate from legacy to modular architecture incrementally. New features go into proper modules. Legacy code is gradually replaced module by module, never in a big-bang rewrite.",
    rationale:
      "Big-bang rewrites have a high failure rate. Strangler fig allows continuous delivery while migrating, and each step delivers value.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `Phase 1: New features → proper modules
Phase 2: Extract highest-value legacy area into module
Phase 3: Route traffic to new module, keep legacy as fallback
Phase 4: Remove legacy code when new module is proven
Phase 5: Repeat for next area`,
      },
      {
        label: "Bad",
        language: "text",
        code: `"Let's rewrite the entire system from scratch"
- 6 months later: still rewriting, no value delivered
- Old system still in production, diverging
- Team demoralized, project cancelled`,
      },
    ],
    tags: ["migration", "strangler", "incremental", "legacy", "rewrite"],
    cleanCodeRefs: [
      {
        principleId: "simple-design-runs-all-tests",
        relationship: "complements",
        note: "Each migration step must pass all tests — incremental confidence",
      },
    ],
    source: "Martin Fowler — Strangler Fig Application",
  },
  {
    id: "extract-module-gradually",
    name: "Extract Module Gradually",
    category: "migration",
    description:
      "When extracting code into a module, do it gradually: first identify the boundary, then move code behind a public API, then enforce the boundary. Don't try to extract and refactor simultaneously.",
    rationale:
      "Gradual extraction reduces risk. Each step is small, reviewable, and reversible. Trying to extract and perfect at the same time leads to scope creep.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `Step 1: Create modules/orders/ directory
Step 2: Move order-related files (don't refactor yet)
Step 3: Create index.ts with public API
Step 4: Update all imports to use index.ts
Step 5: Now refactor internals safely`,
      },
      {
        label: "Bad",
        language: "text",
        code: `Step 1: Create modules/orders/
Step 2: Move files AND refactor AND rename AND add tests
         AND change the database schema AND...
→ Massive PR, impossible to review, high risk of bugs`,
      },
    ],
    tags: ["migration", "extraction", "gradual", "refactoring", "boundary"],
    cleanCodeRefs: [
      {
        principleId: "do-one-thing",
        relationship: "reinforces",
        note: "Each extraction step does one thing: move, then organize, then enforce",
      },
    ],
  },
  {
    id: "start-monolith-first",
    name: "Start Monolith First",
    category: "migration",
    description:
      "Start with a monolithic architecture and modularize when complexity justifies it. Premature modularization adds overhead without value. Wait until you understand the domain boundaries.",
    rationale:
      "Early in a project, domain boundaries are unclear. Starting with a monolith lets you discover real boundaries through usage. Modularize when you have evidence, not assumptions.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `Month 1-3: Simple monolith, fast iteration
Month 4-6: Patterns emerge, some areas more complex
Month 7+:  Extract high-complexity areas into modules
           (Now you KNOW where the boundaries are)`,
      },
      {
        label: "Bad",
        language: "text",
        code: `Day 1: Design 15 modules based on assumptions
Day 2: Realize "orders" and "cart" should be one module
Day 3: Realize "notifications" needs to be split
Day 4: Rewrite module boundaries AGAIN
→ More time on architecture than features`,
      },
    ],
    tags: ["migration", "monolith", "start", "premature", "boundaries"],
    cleanCodeRefs: [
      {
        principleId: "simple-design-minimal",
        relationship: "reinforces",
        note: "Minimal design: don't add module boundaries until they're needed",
      },
    ],
    source: "Martin Fowler — MonolithFirst",
  },
  {
    id: "measure-before-splitting",
    name: "Measure Before Splitting",
    category: "migration",
    description:
      "Before extracting a module or splitting to a service, measure coupling and cohesion. Use dependency analysis, change frequency, and team ownership to decide. Data-driven decisions, not gut feelings.",
    rationale:
      "Splitting based on instinct often creates distributed monoliths. Measuring coupling and cohesion provides evidence for where real boundaries exist.",
    examples: [
      {
        label: "Good",
        language: "text",
        code: `Before splitting, analyze:
✓ Import graph: which files depend on which?
✓ Change coupling: which files change together?
✓ Team ownership: does one team own this area?
✓ Deployment: does this area need independent deployment?
✓ Scale: does this area need independent scaling?`,
      },
      {
        label: "Bad",
        language: "text",
        code: `"Orders feels too big, let's split it into
 order-creation, order-fulfillment, and order-history"
→ No data to support this split
→ High communication overhead between new modules
→ Essentially a distributed monolith`,
      },
    ],
    tags: ["migration", "measure", "coupling", "cohesion", "split", "metrics"],
    cleanCodeRefs: [
      {
        principleId: "high-cohesion",
        relationship: "reinforces",
        note: "Measure cohesion — if a module's parts don't belong together, split is warranted",
      },
    ],
  },
];

export function findRuleById(id: string): ArchitectureRule | undefined {
  return RULES.find((rule) => rule.id === id);
}

export function filterByCategory(category: string): ArchitectureRule[] {
  return RULES.filter((rule) => rule.category === category);
}

