# ADR 002: Backend and database architecture

- **Status:** Accepted
- **Date:** 2026-09-18

## Context

DriverOps has several related business domains: profile and preferences, work sessions, scheduling, earnings, routing, and AI-assisted workflows. These domains share user-owned relational data and require consistent business rules.

The backend must provide a stable API for the mobile application while remaining maintainable for a solo developer and extensible enough to support future clients or integrations.

## Decision

DriverOps will use a modular monolith backend with:

- NestJS
- TypeScript
- REST APIs
- OpenAPI documentation
- PostgreSQL hosted by Supabase
- Supabase Auth for user authentication
- Prisma ORM for application database access
- Prisma Migrate as the authoritative application-schema migration mechanism

The backend will be organised into business-focused NestJS modules such as profile, work sessions, scheduling, earnings, routing, and assistant.

The mobile application will communicate with DriverOps domain data through the backend API. It will not directly implement database persistence or DriverOps business rules against PostgreSQL.

Supabase will provide infrastructure services, particularly managed PostgreSQL and authentication. Supabase platform capabilities are not the DriverOps application architecture.

## Rationale

DriverOps data is naturally relational. Users own profiles, preferences, work sessions, activities, scheduled work, pay configuration, and locations with clear relationships and aggregate reporting requirements. PostgreSQL fits this model directly.

A modular monolith keeps deployment and operations simple while preserving clear domain boundaries. Microservices would add network, deployment, observability, and consistency overhead without solving a current MVP problem.

NestJS provides a structured TypeScript backend with modules, dependency injection, validation, authentication guards, and OpenAPI integration.

Supabase removes the operational burden of self-hosting PostgreSQL and provides a mature authentication service.

Prisma provides typed database access and repeatable migrations while allowing raw SQL where specialised PostgreSQL functionality is appropriate.

## Architectural boundaries

The intended dependency direction is:

```text
Mobile client
    |
    v
REST API
    |
    v
Application/domain services
    |
    v
Persistence layer
    |
    v
PostgreSQL
```

Authentication establishes user identity through Supabase Auth. DriverOps application authorization remains the responsibility of the backend.

Passwords and authentication credentials remain within Supabase Auth and are not duplicated in DriverOps application tables.

## Database migration ownership

Prisma Migrate will own DriverOps application-schema changes.

Application tables must not be created ad hoc through the Supabase dashboard and then independently recreated through Prisma. This avoids schema drift.

Supabase-managed schemas, including authentication internals, remain managed by Supabase.

## Consequences

### Positive

- Business rules have one authoritative server-side execution point.
- Future mobile, web, or integration clients can reuse the same API.
- PostgreSQL supports relational reporting and future geospatial extensions.
- The system can grow internally without introducing microservice complexity.
- Authentication implementation risk is reduced by using Supabase Auth.

### Negative

- The project must deploy and operate a backend service in addition to the mobile application.
- API changes require explicit contract management.
- Prisma and Supabase schema responsibilities must remain clearly separated.

## Alternatives considered

### Supabase-only client architecture

Direct client access to Supabase can reduce initial backend work. It was not selected as the primary architecture because DriverOps has increasingly important domain rules that should not be distributed across mobile clients, database policies, and isolated functions.

### Firebase / Firestore

Firestore is capable and scalable but uses a document-oriented data model. DriverOps has strongly relational data and aggregate reporting needs, making PostgreSQL a more natural fit.

### Microservices

Microservices were rejected for the MVP because they introduce operational complexity without a demonstrated scaling or organisational requirement.
