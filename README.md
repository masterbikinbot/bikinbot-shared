# bikinbot-shared

Shared code library for BikinBot platform. Used by both bikinbot-fe and bikinbot-be.

## Contents

- `shared/src/` — Config, templates, skill catalog, skill registry
- `supabase/src/` — Supabase client, server, middleware helpers

## Usage

Install from GitHub:
```bash
npm install github:masterbikinbot/bikinbot-shared
```

In tsconfig.json, add path aliases:
```json
{
  "paths": {
    "@/lib/shared/*": ["./node_modules/bikinbot-shared/shared/src/*"],
    "@/lib/supabase/*": ["./node_modules/bikinbot-shared/supabase/src/*"]
  }
}
```

## SHA-pin policy

FE and BE consumers pin this library by commit SHA in `package.json`:

```json
"bikinbot-shared": "github:masterbikinbot/bikinbot-shared#<sha>"
```

**Both FE and BE MUST pin the same SHA.** A drift between them means FE and BE
run against different versions of `AVAILABLE_MODELS`, `PLAN_TIERS`, or other
contracts — surfacing as user-visible inconsistencies (e.g. plan features that
appear in FE but BE does not honour).

### Drift checker

From this repo:

```bash
./scripts/check-consumer-drift.sh /path/to/bikinbot-fe /path/to/bikinbot-be
```

Exit code `0` = synced; `1` = drift detected. Run this in CI of either consumer
repo, or as a pre-deploy check.

## Releasing changes

1. Open a PR with a `## SHA <next-sha>` entry in `CHANGELOG.md`.
2. After merge to `master`, get the merge SHA.
3. Update `package.json` in both `bikinbot-fe` and `bikinbot-be` to pin the new SHA.
4. Run `npm install` in each consumer, build, smoke-test, deploy together.
