# Contract: Storage and Migration

## Scope

Defines PostgreSQL 18 production behavior, SQLite compatibility checks, file storage and historical data preservation. It covers FR-009 and FR-010.

## Invariants

- PostgreSQL is the production source of truth; SQLite is test-only migration evidence.
- Schema changes run in explicit transactions where supported, are repeatable, and leave no half-migrated state after failure.
- Migrations preserve ownership, run status, document snapshots, reference evidence, provider originals and deletion markers.
- File paths are resolved inside the configured storage root; symlinks and traversal outside the root fail closed.
- Deletion is soft or retention-protected until the documented purge boundary; history does not point at silently removed bytes.

## Required verification

Run PostgreSQL migration tests, SQLite import compatibility tests, repeated migration tests, rollback/failure tests, path validation tests and history reads over legacy fixtures.

## Compatibility and rollback

New columns and normalized document fields are additive first. Old rows remain readable through explicit defaults. A failed migration rolls back the transaction; a release can return to the previous saved version without destructive data rewrite.
