# ADR 003: Monorepo structure

- **Status:** Accepted
- **Date:** 2026-09-18

## Context

The DriverOps MVP consists of a React Native mobile application and a NestJS backend API. Both are TypeScript applications that will evolve together during early product development.

The repository structure should make cross-cutting changes easy while maintaining strict architectural boundaries between client and server code.

## Decision

DriverOps will use a single Git repository organised as a pnpm workspace.

Initial structure:

```text
DriverOps/
├── apps/
│   ├── mobile/
│   └── api/
├── docs/
│   ├── adr/
│   ├── architecture/
│   └── requirements/
├── .github/
│   └── workflows/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .editorconfig
├── .gitignore
└── README.md
```

The repository will use pnpm as its package manager and workspace implementation.

The mobile and API applications will be organised by business capability rather than by global technical-layer folders.

The mobile application must not import backend implementation code such as NestJS services, repositories, or Prisma models. Communication between mobile and backend occurs through the API contract.

A shared `packages/` hierarchy will not be created pre-emptively. Shared packages will be introduced only when a concrete reusable contract or capability exists.

A generated API client based on the backend OpenAPI specification is a likely future shared package once real API endpoints exist.

## Backend organisation

The API should use feature-oriented NestJS modules, for example:

```text
apps/api/src/
├── auth/
├── profile/
├── work-sessions/
├── scheduling/
├── earnings/
├── routing/
├── assistant/
├── common/
├── database/
├── app.module.ts
└── main.ts
```

Each module may contain its own controllers, services, DTOs, domain logic, and persistence adapters.

## Mobile organisation

The mobile application should separate route definitions from feature implementation, for example:

```text
apps/mobile/
├── app/
└── src/
    ├── features/
    │   ├── profile/
    │   ├── work-sessions/
    │   ├── scheduling/
    │   ├── earnings/
    │   ├── routing/
    │   └── assistant/
    ├── components/
    ├── hooks/
    ├── lib/
    └── services/
```

## Rationale

A monorepo reduces coordination overhead for changes that affect both API and mobile code while keeping product documentation, CI configuration, and engineering standards in one place.

pnpm workspaces provide sufficient dependency and workspace management for the MVP without introducing a task orchestrator before build complexity requires one.

Feature-oriented organisation keeps related code together and makes domain boundaries visible.

## Consequences

### Positive

- One pull request can contain coordinated API and mobile changes when appropriate.
- CI, documentation, and engineering conventions are centralised.
- Dependency installation is efficient and consistent.
- Architectural boundaries remain explicit despite sharing a repository.

### Negative

- Repository tooling must account for multiple applications.
- Poor discipline could lead to accidental client/server coupling.
- CI may need optimisation as the repository grows.

## Alternatives considered

### Separate mobile and API repositories

Separate repositories provide stronger physical isolation but add coordination overhead for early cross-cutting changes. The MVP does not justify that operational cost.

### Nx or Turborepo from the start

Both can provide useful task orchestration and caching. They are not required yet. DriverOps will introduce additional monorepo tooling only if build and CI complexity demonstrates a need.

### Large shared package hierarchy

Creating shared UI, domain, utility, type, and validation packages before duplication exists would add abstraction and coupling. Shared packages will be extracted from demonstrated reuse rather than predicted reuse.
