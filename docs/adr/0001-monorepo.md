# ADR-0001: Use a monorepo
- Status: accepted
## Context
Eight services, three client apps and shared contracts, built by one person while learning.
## Decision
One repo: pnpm + Turborepo (TypeScript), uv workspace (Python), Gradle (Kotlin client).
## Alternatives considered
- Repo per service: more realistic for large orgs, but contract changes need cross-repo PRs; too slow for learning.
## Consequences
Atomic cross-service changes and one clone. CI must use path filters to build only what changed.
