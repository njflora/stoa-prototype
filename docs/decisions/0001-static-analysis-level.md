# 0001: Static analysis levels for the back end

- **Status:** accepted
- **Date:** 23 October 2026

## Context

The back end is a Laravel API of about 4,000 lines of application code. It decides who may watch paid episodes, read members' discussions and post. It records purchases and sets the site's security headers and rate limits.

Larastan (PHPStan with Laravel's rules) checks code without running it. It has levels from 0 to 10. Each level adds stricter checks:

- **5:** argument types, unknown methods and properties.
- **6:** every array and generic type says what it holds.
- **8:** no method call or property access on a value that may be null.
- **9 and 10 (max):** no untyped `mixed` values. Laravel's request, config and query helpers return `mixed` often, so these levels need many explicit checks.

Most teams pick one level for a whole project. A bug in access code costs more than a bug elsewhere: paid content can leak, or a defence can weaken. The access code is also small.

## Decision

Two checks, both in CI:

1. **Level 8 for the whole back end** (`phpstan.neon`): `app`, `config`, `database`, `routes` and `tests`. Run with `composer analyse`.
2. **Max for the access-critical code** (`phpstan-access.neon`). Run with `composer analyse:access`. It covers:
   - `app/Policies`: who may watch, read and post.
   - `app/Discussion`: members-only threads and reading lists.
   - `WatchController` and `AccountController`: streams and purchases.
   - The `User` and `Purchase` models.
   - `SecurityHeaders` and `AppServiceProvider`: headers, rate limits and the staff gate.
   - The base `Controller`: the signed-in account.

Rules for both:

- No baseline file. Findings are fixed, not frozen.
- No ignore comments unless a finding is a confirmed false positive, with the reason beside it.
- Types state what the database or the routes guarantee. For example, `@property-read Show $show` on a model whose `show_id` is a required foreign key.
- `parseModelCastsMethod` is on, so Larastan reads each model's `casts()` method. Without it, dates and arrays are typed as the database's raw strings.

## Consequences

- New code in the access-critical files must pass max. Values from requests, config and the database are read with typed helpers (`$request->string()`, `Config::array()`) or checked before use.
- Moving a file into or out of the access-critical list is a change to this record.
- Raising the whole back end above 8 is possible later, one level at a time, with each level's findings fixed in one change.
- Static analysis checks types, not rules. The access rules themselves are proved by the feature tests, such as `tests/Feature/AccessTest.php`.
