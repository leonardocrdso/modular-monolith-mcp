export interface DecisionNode {
  id: string;
  question: string;
  yes: string; // next node ID or final answer
  no: string;  // next node ID or final answer
}

export interface DecisionTree {
  id: string;
  name: string;
  description: string;
  nodes: DecisionNode[];
}

export const DECISION_TREES: DecisionTree[] = [
  {
    id: "create-vs-expand-module",
    name: "Create New Module vs Expand Existing",
    description:
      "Helps decide whether new functionality should become a new module or be added to an existing one.",
    nodes: [
      {
        id: "start",
        question: "Does the new functionality belong to a different business domain than any existing module?",
        yes: "different-lifecycle",
        no: "existing-cohesion",
      },
      {
        id: "different-lifecycle",
        question: "Does it have a different change frequency or deployment lifecycle?",
        yes: "ANSWER: Create a new module. Different domain + different lifecycle = clear boundary.",
        no: "different-team",
      },
      {
        id: "different-team",
        question: "Will it be owned by a different team or developer?",
        yes: "ANSWER: Create a new module. Different ownership justifies separation.",
        no: "data-ownership",
      },
      {
        id: "data-ownership",
        question: "Does it own its own data (new tables/collections)?",
        yes: "ANSWER: Create a new module. Data ownership is a strong boundary signal.",
        no: "ANSWER: Consider creating a new module, but it could also be a sub-feature of a related module. Start within the existing module and extract later if it grows.",
      },
      {
        id: "existing-cohesion",
        question: "Is the existing module already large (>10 files or >1000 lines of business logic)?",
        yes: "change-together",
        no: "ANSWER: Expand the existing module. It's small enough and the functionality is cohesive.",
      },
      {
        id: "change-together",
        question: "Does the new functionality change together with the existing code (same PRs, same features)?",
        yes: "ANSWER: Expand the existing module. High change coupling means it belongs together.",
        no: "ANSWER: Create a new module. The existing module is large and this functionality has different change reasons.",
      },
    ],
  },
  {
    id: "sync-vs-async-communication",
    name: "Sync vs Async Communication",
    description:
      "Helps decide whether communication between modules should be synchronous (service call) or asynchronous (events).",
    nodes: [
      {
        id: "start",
        question: "Does the caller need an immediate response to continue its operation?",
        yes: "read-or-write",
        no: "failure-tolerance",
      },
      {
        id: "read-or-write",
        question: "Is this a read/query operation (getting data)?",
        yes: "ANSWER: Use synchronous service call. Reads naturally need immediate data. Import and call the module's service directly.",
        no: "transactional",
      },
      {
        id: "transactional",
        question: "Does this need to be part of the same transaction (all-or-nothing)?",
        yes: "ANSWER: Use synchronous service call. Transactional operations need immediate confirmation. Consider a saga pattern if the transaction spans multiple modules.",
        no: "ANSWER: Consider async events. The write doesn't need immediate confirmation from the other module. Emit an event and let the other module handle it.",
      },
      {
        id: "failure-tolerance",
        question: "Is it acceptable if the other module processes this later or even fails?",
        yes: "multiple-consumers",
        no: "ANSWER: Use synchronous service call. If failure is not acceptable, you need immediate confirmation.",
      },
      {
        id: "multiple-consumers",
        question: "Could multiple modules need to react to this same event?",
        yes: "ANSWER: Use async events. Multiple consumers is the strongest signal for events. Emit once, many modules can listen.",
        no: "ANSWER: Use async events. Fire-and-forget with tolerance for delayed processing is a good fit for events.",
      },
    ],
  },
  {
    id: "when-to-extract-microservice",
    name: "When to Extract to Microservice",
    description:
      "Helps decide whether a module in a modular monolith should be extracted into an independent microservice.",
    nodes: [
      {
        id: "start",
        question: "Does this module need independent scaling (e.g., 10x more traffic than the rest)?",
        yes: "team-ownership",
        no: "independent-deploy",
      },
      {
        id: "independent-deploy",
        question: "Does this module need independent deployment (different release cycle)?",
        yes: "team-ownership",
        no: "tech-requirements",
      },
      {
        id: "tech-requirements",
        question: "Does this module require a different technology stack (different language, specialized DB)?",
        yes: "boundary-clean",
        no: "ANSWER: Keep as module in the monolith. There's no compelling reason to extract. The overhead of a separate service isn't justified.",
      },
      {
        id: "team-ownership",
        question: "Is there a dedicated team that will own this service end-to-end?",
        yes: "boundary-clean",
        no: "ANSWER: Keep as module for now. Without a dedicated team, a microservice becomes an orphan. Invest in team structure first.",
      },
      {
        id: "boundary-clean",
        question: "Are the module boundaries already clean (public API, no shared DB, minimal sync calls)?",
        yes: "ANSWER: Extract to microservice. You have clean boundaries, a good reason, and team ownership. The module is ready.",
        no: "ANSWER: Clean up boundaries first, then extract. Extracting a module with leaky boundaries creates a distributed monolith. First: enforce public API, remove shared DB access, minimize coupling. Then extract.",
      },
    ],
  },
];

export function findDecisionTreeById(id: string): DecisionTree | undefined {
  return DECISION_TREES.find((tree) => tree.id === id);
}
