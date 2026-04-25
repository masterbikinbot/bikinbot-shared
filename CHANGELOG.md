# Changelog
All notable changes to `bikinbot-shared` will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This library is consumed by `bikinbot-fe` and `bikinbot-be` via GitHub SHA-pin.
**To minimize FE↔BE contract drift, both consumers MUST pin to the same SHA.**

## [Unreleased]
### Added
- `CHANGELOG.md` — track changes & breaking surface.
- README note about SHA-pin policy & drift check.
### Changed
- (no behavior change yet)

## SHA `4ddde2f` — 2026-04-25
Fix: allow grace users to access `/subscribe` for renewal.
- Affects: dashboard / subscribe redirect rules.
- Consumer impact: FE & BE both should pin to this SHA so grace-period redirect logic is consistent.

## SHA `50e9e03` — 2026-04-23
feat: update PLAN_TIERS features — 30+ models, clean Pro/Ultra lists.
- Affects: `PLAN_TIERS` shape (no breaking field rename, additive features).
- Consumer impact: FE pricing page + BE plan-config endpoint show consistent feature list.

## SHA `4bc6a3a` — 2026-04-22
fix: allow grace period users to access dashboard.

## SHA `95066b1` — 2026-04-21
Update AVAILABLE_MODELS: add 7 new models, re-categorize 3 by cost tier.
- Affects: `AVAILABLE_MODELS` map.
- Consumer impact: FE settings/routing model picker + BE smart router must reference same model list.

## SHA `2f5151a` — 2026-04-19
ci: auto-notify FE+BE when shared code changes.

## SHA `a25d971` — 2026-04-18
fix: remove duplicate TELEGRAM_ALERT_TOKEN export.

## SHA `c56dc82` — 2026-04-15
feat: add CONTABO_PASSWORD, TELEGRAM_ALERT_TOKEN, ADMIN_KEY, APP_VERSION to config.
- Note: `CONTABO_PASSWORD` is referenced via `process.env`. The literal value of this secret must NEVER appear in any source file. Audit 2026-04-25 confirmed only env-var references in production code paths (one literal occurrence in `bikinbot-be/scripts/e2e-round12.mjs:84` was removed in BE PR `fix/audit-be-comprehensive`).

## SHA `3cfc63f` — 2026-04-12
feat: initial bikinbot-shared library.
