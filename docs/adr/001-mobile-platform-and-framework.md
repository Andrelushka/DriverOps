# ADR 001: Mobile platform and framework

- **Status:** Accepted
- **Date:** 2026-09-18

## Context

DriverOps is intended for professional drivers and other users whose work involves substantial time behind the wheel. The MVP requires work-time tracking, scheduling, earnings information, route planning, and an AI assistant. Future capabilities may require deeper device integration, including background location and notifications.

The client platform therefore needs strong access to native mobile capabilities while remaining practical for a solo developer building and maintaining both Android and iOS versions.

## Decision

DriverOps MVP will be a mobile-first application targeting Android and iOS from a shared codebase.

The client will use:

- React Native
- Expo
- TypeScript
- Expo Router for application navigation

A web/PWA client is not part of the MVP.

Background location support will remain an architectural capability but will not be implemented until a concrete product requirement justifies the associated privacy, battery, permission, and platform-policy costs.

The MVP will not implement a proprietary turn-by-turn navigation engine. Route planning may hand off active navigation to an established navigation provider.

## Rationale

React Native provides a shared Android/iOS codebase while retaining access to native platform capabilities. Expo provides the recommended React Native application framework and reduces build, routing, configuration, and native integration overhead without preventing later native extensions.

TypeScript keeps the mobile application consistent with the proposed backend language and provides static typing across API integration and application code.

A mobile-first approach is more appropriate than a PWA because location, notifications, maps, and future background capabilities are central to the DriverOps product direction.

## Consequences

### Positive

- Android and iOS can share most application code.
- Native device capabilities remain available.
- The MVP avoids maintaining independent Kotlin and Swift applications.
- Expo reduces initial native tooling and configuration overhead.
- TypeScript can be used consistently across client and server code.

### Negative

- Some platform-specific behaviour will still require Android/iOS testing and configuration.
- Certain advanced native integrations may eventually require custom native modules or development builds.
- A web client will require separate implementation later if the product needs one.

## Alternatives considered

### Flutter

Flutter is a viable cross-platform option with strong mobile support. It was not selected because DriverOps does not require a custom rendering model, while React Native fits the intended application UI and keeps the project in the TypeScript ecosystem.

### Fully native Android and iOS

Native development offers maximum platform control but would require maintaining two application codebases. That cost is not justified for the MVP.

### Web/PWA

A PWA could support some DriverOps functions but is a weaker foundation for future device-centric and background-location workflows. It may be appropriate for a future desktop or fleet-management surface rather than the primary driver application.
