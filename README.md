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
