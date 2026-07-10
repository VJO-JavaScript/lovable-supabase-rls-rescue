# ADR 0001: Use PGlite for the deterministic policy evidence harness

## Status

Accepted for the synthetic reference implementation.

## Context

The portfolio proof needs real PostgreSQL roles, policies, transactions, and RLS
behavior without requiring a hosted Supabase project, production credentials,
or Docker. Reviewers should be able to reproduce the evidence with one locked
Node.js install.

## Decision

Run the migrations in an ephemeral PGlite database. Fixture setup runs as the
database owner, while every authorization assertion switches to the explicit
`anon` or `authenticated` role and provides a transaction-local synthetic JWT
subject. Each request rolls back so role and identity state cannot leak between
assertions.

## Consequences

- The harness exercises PostgreSQL policy semantics and role grants directly.
- A clean run needs no network service, Docker daemon, or secret.
- CI is fast and deterministic.
- The harness does **not** emulate hosted Supabase Auth, JWT verification,
  PostgREST, Realtime, Storage, Edge Functions, or platform configuration.
- A real engagement still needs an authorized staging verification at those
  hosted boundaries before production change approval.

## Rejected alternatives

- A service-role-only unit test would bypass RLS and provide false confidence.
- A hosted demo would require credentials and create an unnecessary public
  attack surface.
- Docker-based Supabase CLI tests would improve platform fidelity, but Docker is
  not required for this portable first proof. They remain a future integration
  layer, not something this repository silently claims to cover.
