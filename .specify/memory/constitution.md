<!--
Sync Impact Report
- Version change: unratified template -> 1.0.0
- Modified principles: none (initial ratification)
- Added principles:
  - I. Single Policy Authority
  - II. Outcome-First Specification
  - III. Ordered Artifact Flow
  - IV. End-to-End Traceability
  - V. Evidence-Based Convergence
- Added sections:
  - Artifact Responsibilities
  - Workflow Stage Gates
- Removed sections: none
- Follow-up TODOs: none
-->
# Garment Canvas Spec Kit Constitution

## Core Principles

### I. Single Policy Authority
`AGENTS.md` is the sole authority for permissions, approval boundaries, product scope,
engineering standards, testing requirements, Git operations, and release policy. Spec Kit
artifacts MUST read and comply with the applicable `AGENTS.md`, but MUST NOT copy or
rephrase those policies. If a workflow artifact contains policy text, it MUST be replaced
with a direct reference to the authoritative section instead of creating a second source
of truth.

Rationale: each rule must have one owner so policy changes do not create drift,
contradictory instructions, or unnecessary approval stops.

### II. Outcome-First Specification
Every feature MUST begin with a specification that states user outcomes, prioritized user
scenarios, acceptance criteria, assumptions, dependencies, and explicit exclusions. The
specification MUST describe what users need and how success is observed. It MUST NOT lock
in implementation details that belong in the plan unless the detail is itself an approved
requirement.

Rationale: separating desired behavior from implementation keeps requirements reviewable
and allows planning to compare technically sound approaches.

### III. Ordered Artifact Flow
Feature work MUST follow this artifact sequence:

1. `$speckit-specify` creates or updates `spec.md`.
2. `$speckit-clarify` resolves material ambiguity when needed, before planning.
3. `$speckit-plan` creates the implementation plan and supporting design artifacts.
4. `$speckit-tasks` creates dependency-ordered, executable tasks.
5. `$speckit-analyze` checks cross-artifact consistency when the change is material.
6. `$speckit-implement` executes approved tasks.
7. `$speckit-converge` compares implementation with the artifacts and appends remaining
   work until the feature converges.

A later stage MUST NOT invent missing decisions from an earlier artifact. It MUST return
the gap to the owning stage for correction.

Rationale: explicit stage ownership prevents plans, tasks, and code from silently
changing approved requirements.

### IV. End-to-End Traceability
Every functional requirement MUST map to at least one acceptance scenario. Every planned
component and task MUST identify the requirement or scenario it serves. Every completed
task MUST name the implementation and verification evidence that satisfies it. Orphan
requirements, unowned tasks, and implementation changes without a specification link
MUST be resolved before the next stage.

Rationale: traceability makes omissions and unintended scope expansion visible before
they reach implementation or release review.

### V. Evidence-Based Convergence
Progress MUST be represented by artifact state and verifiable evidence, not by narrative
claims. `$speckit-implement` MUST update task status only after the task output exists.
`$speckit-converge` MUST append uncovered or incomplete work to `tasks.md` rather than
declaring partial implementation complete. A feature is converged only when all required
scenarios, tasks, and evidence are accounted for and no unresolved material inconsistency
remains.

Rationale: the workflow must expose remaining work and make completion reproducible by a
reviewer.

## Artifact Responsibilities

- `spec.md` owns user intent, scenarios, requirements, acceptance criteria, assumptions,
  dependencies, and exclusions.
- `plan.md` and supporting design artifacts own architecture choices, interfaces, data
  models, sequencing, and the Constitution Check.
- `tasks.md` owns dependency order, execution scope, parallelization markers, completion
  state, and requirement traceability.
- Implementation files and verification output own the evidence that tasks were executed;
  they do not silently redefine the specification.
- `AGENTS.md` owns project policy. Spec Kit artifacts reference it and do not duplicate it.

## Workflow Stage Gates

- Specification may enter clarification or planning only when prioritized scenarios and
  observable acceptance criteria exist.
- Planning may enter task generation only when the Constitution Check passes and material
  technical unknowns are resolved or explicitly recorded.
- Tasks may enter implementation only when they are dependency ordered, independently
  actionable, and traceable to requirements or scenarios.
- Implementation may enter convergence only when task status and available evidence have
  been updated honestly.
- Convergence completes only when artifact inconsistencies are resolved and no required
  work remains. Any permissions or project-specific gates referenced during these stages
  are evaluated exclusively from `AGENTS.md`.

## Governance

This constitution governs only the Spec Kit workflow and its artifacts. It MUST NOT
define or override project permissions, product boundaries, engineering conventions,
verification commands, Git policy, or release authority; those belong exclusively to
`AGENTS.md`.

Amendments MUST explain the workflow problem being solved and identify affected artifact
stages. Versioning follows semantic versioning: MAJOR for incompatible stage or ownership
changes, MINOR for new workflow principles or gates, and PATCH for non-semantic
clarifications. Each amendment MUST update the Sync Impact Report and `Last Amended`
date.

Every generated plan MUST include a Constitution Check covering artifact ownership,
stage order, traceability, and the absence of duplicated project policy. Workflow
exceptions MUST be explicit in the relevant artifact and approved through the authority
defined by `AGENTS.md`.

**Version**: 1.0.0 | **Ratified**: 2026-09-02 | **Last Amended**: 2026-09-02
