# ADR-0002: RabbitMQ as the message broker
- Status: accepted
## Context
Order workflows need ack/retry/dead-letter semantics, and the broker must be easy to run locally.
## Decision
RabbitMQ (topic exchange for events, direct exchange for commands, DLX for dead letters).
## Alternatives considered
- Kafka: better for event streaming and replay, heavier to operate; not needed for task-style workflows.
## Consequences
Simple local setup and clear retry/DLQ model. Replaying history is harder (stretch goal: Kafka branch).
