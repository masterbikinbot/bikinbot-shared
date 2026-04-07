/**
 * skill-catalog.ts — Curated & audited skill catalog for BikinBot Skill Marketplace
 *
 * Only skills in this list can be installed by users.
 * Each skill is audited for security before being added.
 *
 * Max 5 skills per user (to conserve disk space).
 */

export interface CatalogSkill {
  slug: string              // ClawHub skill slug (used for install)
  name: string              // Display name
  description: string       // Short description in Indonesian
  icon: string              // Emoji icon
  category: 'Produktivitas' | 'Bahasa' | 'Media' | 'Data' | 'Utilitas'
  requiresApiKey?: boolean  // If true, user needs to provide an API key
  popular?: boolean
}

export const MAX_SKILLS_PER_USER = 5

export const SKILL_CATALOG: CatalogSkill[] = [
  // ═══ Produktivitas ═══
  {
    slug: 'weather',
    name: 'Weather',
    description: 'Cek cuaca real-time dan prakiraan untuk lokasi mana pun. Tanpa API key.',
    icon: '🌤️',
    category: 'Produktivitas',
    popular: true,
  },
  {
    slug: 'summarize',
    name: 'Summarize',
    description: 'Rangkum dokumen, artikel, atau teks panjang jadi poin-poin penting.',
    icon: '📝',
    category: 'Produktivitas',
    popular: true,
  },
  {
    slug: 'writing',
    name: 'Writing Assistant',
    description: 'Bantu menulis: blog, email, caption sosmed, copy iklan, dan editing.',
    icon: '✍️',
    category: 'Produktivitas',
  },
  {
    slug: 'business-writing',
    name: 'Business Writing',
    description: 'Template dan bantuan menulis dokumen bisnis: proposal, laporan, email formal.',
    icon: '💼',
    category: 'Produktivitas',
  },

  // ═══ Bahasa ═══
  {
    slug: 'language-learning',
    name: 'Language Tutor',
    description: 'Tutor bahasa asing interaktif. Vocab, grammar, percakapan, dan flashcard.',
    icon: '🌍',
    category: 'Bahasa',
    popular: true,
  },

  // ═══ Media ═══
  {
    slug: 'video-frames',
    name: 'Video Frames',
    description: 'Ekstrak frame atau clip pendek dari file video.',
    icon: '🎬',
    category: 'Media',
  },

  // ═══ Data ═══
  {
    slug: 'crypto-market-data',
    name: 'Crypto Market Data',
    description: 'Data harga crypto real-time. Tanpa API key.',
    icon: '₿',
    category: 'Data',
    popular: true,
  },

  // ═══ Utilitas ═══
  {
    slug: 'coding',
    name: 'Coding Helper',
    description: 'Bantu coding: debug, review code, explain konsep, best practices.',
    icon: '💻',
    category: 'Utilitas',
  },
  {
    slug: 'healthcheck',
    name: 'Health Check',
    description: 'Monitor kesehatan server dan sistem. Cek uptime, disk, memory.',
    icon: '🏥',
    category: 'Utilitas',
  },
]

export const SKILL_CATEGORIES = [
  { id: 'Semua', label: 'Semua', icon: '📋' },
  { id: 'Produktivitas', label: 'Produktivitas', icon: '⚡' },
  { id: 'Bahasa', label: 'Bahasa', icon: '🌍' },
  { id: 'Media', label: 'Media', icon: '🎬' },
  { id: 'Data', label: 'Data', icon: '📊' },
  { id: 'Utilitas', label: 'Utilitas', icon: '🔧' },
] as const

export function getSkillBySlug(slug: string): CatalogSkill | undefined {
  return SKILL_CATALOG.find(s => s.slug === slug)
}
