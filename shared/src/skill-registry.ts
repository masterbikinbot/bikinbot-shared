import { SKILL_PATHS } from './config'

export interface SkillDef {
  id: string
  name: string
  description: string
  source: string
  hasInstallScript?: boolean
}

export const BASE_SKILLS: SkillDef[] = [
  // ── Security (always installed) ──────────────────────────────────────────
  {
    id: 'clawdefender',
    name: 'ClawDefender',
    description: 'Security scanner — detects prompt injection, malicious skills, SSRF',
    source: SKILL_PATHS.clawdefender,
  },
  {
    id: 'skill-vetting',
    name: 'Skill Vetting',
    description: 'Vet new skills for security before installation',
    source: SKILL_PATHS.skillVetting,
  },
  {
    id: 'self-reflection',
    name: 'Self Reflection',
    description: 'Learn from mistakes and improve over time',
    source: SKILL_PATHS.selfReflection,
  },
  // ── Passive Platform Skills (auto-installed for all users) ────────────────
  {
    id: 'auto-backup',
    name: 'Auto Backup',
    description: 'Backup MEMORY.md to Supabase Storage daily at 23:00 WIB, retain 7 days',
    source: SKILL_PATHS.autoBackup,
    hasInstallScript: true,
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    description: 'Daily morning briefing: cuaca, berita, crypto, reminder — 07:00 WIB',
    source: SKILL_PATHS.morningRoutine,
  },
  {
    id: 'auto-update',
    name: 'Auto Update',
    description: 'Weekly check for new OpenClaw releases, notify user before any update',
    source: SKILL_PATHS.autoUpdate,
  },
  // ── Proactive Behaviors (BikinBot Differentiator) ─────────────────────────
  {
    id: 'proactive-behaviors',
    name: 'Proactive Behaviors',
    description: 'Sentiment detection, topic check-in, cross-session awareness, auto-doc',
    source: SKILL_PATHS.proactiveBehaviors,
    hasInstallScript: true,
  },
]

export const PERSONA_SKILLS: Record<string, SkillDef[]> = {
  'assistant': [],
  'cs': [],
  'sales': [],
  'toko-online': [],
  'resto': [],
  'klinik': [],
  'properti': [],
  'travel': [],
  'lawyer': [],
  'teacher': [
    { id: 'language-learning', name: 'Language Learning', description: 'Multi-language tutor', source: '/root/clawd/skills/language-learning' },
  ],
  'quran': [],
  'socmed': [
    { id: 'seo', name: 'SEO', description: 'Search engine optimization', source: SKILL_PATHS.seo },
  ],
  'copywriter': [
    { id: 'seo', name: 'SEO', description: 'Search engine optimization', source: SKILL_PATHS.seo },
  ],
  'coding': [
    { id: 'react-expert', name: 'React Expert', description: 'React 18+ development', source: '/root/clawd/skills/react-expert' },
    { id: 'typescript', name: 'TypeScript', description: 'Type-safe TypeScript patterns', source: SKILL_PATHS.typescript },
    { id: 'testing-patterns', name: 'Testing Patterns', description: 'Unit/integration/E2E testing', source: SKILL_PATHS.testingPatterns },
  ],
  'custom': [],
}

export function getSkillsForPersona(personaId: string): SkillDef[] {
  const personaSkills = PERSONA_SKILLS[personaId] || []
  return [...BASE_SKILLS, ...personaSkills]
}
