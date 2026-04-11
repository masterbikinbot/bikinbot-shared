/**
 * lib/config.ts — Single source of truth for all app-wide constants
 *
 * RULES:
 * - Never hardcode values elsewhere if they're defined here
 * - All env vars have safe defaults
 * - Update here = reflected everywhere
 *
 * Last updated: 15 Mar 2026
 */

// ─────────────────────────────────────────────────────────
// Environment Variables — Single source of truth
// All process.env reads should be HERE, not in routes/libs
// ─────────────────────────────────────────────────────────

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// VPS / SSH
export const VPS_HOST = process.env.VPS_HOST || process.env.CONTABO_HOST || '144.91.82.85'
export const VPS_SCRIPTS_DIR = '/opt/bikinbot/scripts'
export const OPENCLAW_BIN = '/usr/bin/openclaw'

// App
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'

// Auth / Secrets
export const CRON_SECRET = process.env.CRON_SECRET || process.env.CREDIT_SYNC_SECRET || ''
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''

// OpenRouter
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
export const OPENROUTER_MGMT_KEY = process.env.OPENROUTER_MGMT_KEY || process.env.OPENROUTER_MANAGEMENT_KEY || ''
export const OPENROUTER_EMBEDDING_KEY = process.env.OPENROUTER_EMBEDDING_KEY || process.env.OPENROUTER_API_KEY || ''

// MayaRamp
export const MAYARAMP_CLIENT_ID = process.env.MAYARAMP_CLIENT_ID || ''
export const MAYARAMP_BASE_URL = process.env.MAYARAMP_BASE_URL || 'https://api.mayaramp.com'
export const MAYARAMP_PRIVATE_KEY = process.env.MAYARAMP_PRIVATE_KEY || ''
export const MAYARAMP_WEBHOOK_VERIFY_KEY = process.env.MAYARAMP_WEBHOOK_VERIFY_KEY || ''

// Telegram
// (these are already exported, we re-export from existing config)

// External APIs
export const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
export const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY || ''
export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || ''

// Bot Proxy
export const BOT_PROXY_BASE = process.env.BOT_PROXY_BASE || 'https://bikinbot.ai/api/proxy/bot-chat'

// ─────────────────────────────────────────────────────────
// Currency & Pricing
// ─────────────────────────────────────────────────────────
export const USD_TO_IDR = parseInt(process.env.USD_TO_IDR || '16500', 10)
export const MARKUP = 0.10 // 10% markup on AI usage cost

export const PLAN_PRICE_IDR = {
  monthly: 500_000,   // Rp500.000/bulan (Basic)
  annual: 5_000_000,  // Rp5.000.000/tahun (Basic)
} as const

export const CREDIT_PER_PLAN_IDR = {
  monthly: 100_000,   // credit bulanan (Basic)
  annual: 1_500_000,  // credit tahunan (Basic)
} as const

// ─────────────────────────────────────────────────────────
// Plan Tiers — single source of truth for ALL pricing/features
// ─────────────────────────────────────────────────────────
export interface PlanTier {
  name: string
  monthly: { price: number; original: number; saving: string; plan: string }
  annual: { price: number; original: number; saving: string; plan: string; perMonth: number; creditNote: string }
  credit: { monthly: number; annual: number }
  ram: string
  disk: string
  monthlyFeatures: string[]
  annualFeatures: string[]
}

export const PLAN_TIERS: Record<string, PlanTier> = {
  basic: {
    name: 'Basic',
    monthly: { price: 500_000, original: 1_000_000, saving: 'Hemat 50%', plan: 'basic_monthly' },
    annual: { price: 5_000_000, original: 12_000_000, saving: 'Hemat 58%', plan: 'basic_annual', perMonth: 416_000, creditNote: 'Rp 1.500.000 Credit AI / Tahun' },
    credit: { monthly: 100_000, annual: 1_500_000 },
    ram: 'Dedicated RAM',
    disk: '5GB Disk Storage',
    monthlyFeatures: [
      'AI Agent aktif 24/7',
      '15+ model AI premium (Gemini, Claude, GPT, dll)',
      'Rp 100.000 credit AI/bulan',
      'Dedicated RAM',
      '5GB Disk Storage',
      'Telegram',
      'Dashboard monitoring real-time',
      'Auto-recovery & health monitoring',
      'Free Access to Komunitech Community',
    ],
    annualFeatures: [
      'AI Agent aktif 24/7',
      '15+ model AI premium (Gemini, Claude, GPT, dll)',
      'Rp 1.500.000 Credit AI / Tahun',
      'Dedicated RAM',
      '5GB Disk Storage',
      'Telegram',
      'Dashboard monitoring real-time',
      'Auto-recovery & health monitoring',
      'Free Access to Komunitech Community',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: { price: 750_000, original: 2_000_000, saving: 'Hemat 63%', plan: 'pro_monthly' },
    annual: { price: 7_500_000, original: 24_000_000, saving: 'Hemat 69%', plan: 'pro_annual', perMonth: 625_000, creditNote: 'Rp 3.000.000 Credit AI / Tahun' },
    credit: { monthly: 200_000, annual: 3_000_000 },
    ram: 'Dedicated RAM',
    disk: '10GB Disk Storage',
    monthlyFeatures: [
      'Semua fitur Basic',
      'Dedicated RAM',
      '10GB Disk Storage',
      'Rp 200.000 Credit AI per bulan',
      'Priority Support',
    ],
    annualFeatures: [
      'Semua fitur Basic',
      'Dedicated RAM',
      '10GB Disk Storage',
      'Rp 3.000.000 Credit AI / Tahun',
      'Priority Support',
    ],
  },
  ultra: {
    name: 'Ultra',
    monthly: { price: 1_250_000, original: 4_000_000, saving: 'Hemat 69%', plan: 'ultra_monthly' },
    annual: { price: 12_500_000, original: 48_000_000, saving: 'Hemat 74%', plan: 'ultra_annual', perMonth: 1_041_000, creditNote: 'Rp 6.000.000 Credit AI / Tahun' },
    credit: { monthly: 400_000, annual: 6_000_000 },
    ram: 'Dedicated RAM',
    disk: '25GB Disk Storage',
    monthlyFeatures: [
      'Semua Fitur Pro +',
      'Dedicated RAM',
      '25GB Disk Storage',
      'Rp 400.000 Credit AI per bulan',
    ],
    annualFeatures: [
      'Semua Fitur Pro +',
      'Dedicated RAM',
      '25GB Disk Storage',
      'Rp 6.000.000 Credit AI / Tahun',
    ],
  },
}

export const PAYMENT_METHODS_CONFIG = [
  { value: 'QRIS', label: 'QRIS', desc: 'Scan & bayar dari e-wallet atau m-banking', fee: '0.7%', minAmount: 10_000 },
  { value: 'VA_BNI', label: 'VA BNI', desc: 'Transfer via BNI Virtual Account', fee: 'Rp3.500', minAmount: 15_000 },
  { value: 'VA_BRI', label: 'VA BRI', desc: 'Transfer via BRI Virtual Account', fee: 'Rp3.500', minAmount: 15_000 },
  { value: 'VA_MANDIRI', label: 'VA Mandiri', desc: 'Transfer via Mandiri Virtual Account', fee: 'Rp3.500', minAmount: 15_000 },
  { value: 'VA_PERMATA', label: 'VA Permata', desc: 'Transfer via Permata Virtual Account', fee: 'Rp3.500', minAmount: 15_000 },
  { value: 'VA_CIMB', label: 'VA CIMB', desc: 'Transfer via CIMB Niaga Virtual Account', fee: 'Rp3.500', minAmount: 15_000 },
] as const

export const TOP_UP_PRESETS = [
  { label: 'Rp50.000', value: 50_000 },
  { label: 'Rp100.000', value: 100_000 },
  { label: 'Rp200.000', value: 200_000 },
  { label: 'Rp500.000', value: 500_000 },
] as const

export const CREDIT_THRESHOLDS = {
  low: 15_000,      // show "almost empty" warning
  warning: 30_000,  // show "getting low" reminder
} as const

// ─────────────────────────────────────────────────────────
// Resource Limits (per user bot)
// ─────────────────────────────────────────────────────────
export const DEFAULT_RAM_LIMIT_MB = 2048
export const DEFAULT_DISK_LIMIT_MB = 2048
export const CREDIT_LOW_THRESHOLD_IDR = 5_000  // show warning below this

// ─────────────────────────────────────────────────────────
// VPS / Infrastructure
// ─────────────────────────────────────────────────────────
export const VPS_USER_BASE_DIR = '/home/bikinbot/users'

// Contabo VPS — user bots run here (SSH from Alibaba platform server)
export const CONTABO_HOST = process.env.CONTABO_HOST || '144.91.82.85'
export const SCRIPTS_DIR = '/opt/bikinbot/scripts'
export const NETWORK_ISOLATION_SCRIPT = `${SCRIPTS_DIR}/setup-network-isolation.sh`

// ─────────────────────────────────────────────────────────
// Telegram Alerts
// ─────────────────────────────────────────────────────────
export const TELEGRAM_ALERT_CHAT_ID = process.env.TELEGRAM_ALERT_CHAT_ID || '-1003786780707'
export const TELEGRAM_ALERT_TOKEN = process.env.TELEGRAM_ALERT_TOKEN || ''

// ─────────────────────────────────────────────────────────
// Bot Ports (internal, used for health checks)
// ─────────────────────────────────────────────────────────
export const BOT_PORT_RANGE = {
  start: 19000,
  end: 19200,
} as const

// ─────────────────────────────────────────────────────────
// AI Models — canonical list, single source for FE + BE
// ─────────────────────────────────────────────────────────
export const DEFAULT_MODEL = 'openrouter/google/gemini-2.5-flash'

// OpenRouter prefix to full model ID (for provisioning)
export const OPENROUTER_MODEL_PREFIX = 'openrouter/'

export interface ModelInfo {
  name: string
  costTier: 'gratis' | 'hemat' | 'standar' | 'premium'
  description: string
  caps?: string[]  // e.g. ['image', 'audio', 'video', 'file']
  isDefault?: boolean
}

// Curated & verified against OpenRouter live API (11 Apr 2026)
// IDs must match OpenRouter exactly. Update here = reflected in API + FE.
export const AVAILABLE_MODELS: Record<string, ModelInfo> = {
  // ─ GRATIS ────────────────────────────────────────────────
  'google/gemma-3-27b-it:free': {
    name: 'Gemma 3 27B',
    costTier: 'gratis',
    description: 'Google gratis. 131K context, bisa lihat gambar.',
    caps: ['image'],
  },
  'nvidia/nemotron-nano-12b-v2-vl:free': {
    name: 'Nemotron Nano VL',
    costTier: 'gratis',
    description: 'NVIDIA gratis. Vision + video support.',
    caps: ['image', 'video'],
  },
  'meta-llama/llama-3.3-70b-instruct:free': {
    name: 'Llama 3.3 70B',
    costTier: 'gratis',
    description: 'Meta gratis. 70B parameter, general purpose.',
  },
  // ─ HEMAT ─────────────────────────────────────────────────
  'mistralai/mistral-small-3.1-24b-instruct': {
    name: 'Mistral Small 3.1',
    costTier: 'hemat',
    description: 'Mistral vision. Super murah & cepat.',
    caps: ['image'],
  },
  'openai/gpt-5-nano': {
    name: 'GPT-5 Nano',
    costTier: 'hemat',
    description: 'OpenAI termurah. 400K context, vision support.',
    caps: ['image', 'file'],
  },
  'google/gemini-2.0-flash-lite-001': {
    name: 'Gemini 2.0 Flash Lite',
    costTier: 'hemat',
    description: 'Gemini lite. Semua media, harga hemat.',
    caps: ['image', 'audio', 'video'],
  },
  'minimax/minimax-m2.5': {
    name: 'MiniMax M2.5',
    costTier: 'hemat',
    description: 'MiniMax. Cepat & efisien, 196K context.',
  },
  'openai/gpt-4o-mini': {
    name: 'GPT-4o Mini',
    costTier: 'hemat',
    description: 'Versi mini GPT-4o. Cepat & efisien dari OpenAI.',
    caps: ['image', 'file'],
  },
  'meta-llama/llama-4-maverick': {
    name: 'Llama 4 Maverick',
    costTier: 'hemat',
    description: 'Meta terbaru. 1M context, sangat efisien.',
    caps: ['image'],
  },
  'arcee-ai/trinity-large-thinking': {
    name: 'Arcee Trinity Thinking',
    costTier: 'hemat',
    description: 'Arcee AI reasoning model. Murah & pintar untuk analisis. 262K context.',
  },
  'deepseek/deepseek-v3.2': {
    name: 'DeepSeek V3.2',
    costTier: 'hemat',
    description: 'Open-source terbaru China. Coding & chat pintar.',
  },
  'x-ai/grok-3-mini': {
    name: 'Grok 3 Mini',
    costTier: 'hemat',
    description: 'Model mini xAI. Cepat & pintar.',
  },
  'qwen/qwen3.5-plus-02-15': {
    name: 'Qwen 3.5 Plus',
    costTier: 'hemat',
    description: 'Alibaba. 1M context, multilingual kuat.',
    caps: ['image', 'video'],
  },
  'perplexity/sonar': {
    name: 'Perplexity Sonar',
    costTier: 'hemat',
    description: 'AI + search built-in. Jawaban selalu up-to-date.',
    caps: ['image'],
  },
  'openai/gpt-4.1-mini': {
    name: 'GPT-4.1 Mini',
    costTier: 'hemat',
    description: 'GPT terbaru versi lite. 1M context.',
    caps: ['image', 'file'],
  },
  'google/gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    costTier: 'hemat',
    description: 'Default BikinBot. Tercepat dari Google. 1M context.',
    caps: ['image', 'audio', 'video', 'file'],
    isDefault: true,
  },
  'moonshotai/kimi-k2.5': {
    name: 'Kimi K2.5',
    costTier: 'hemat',
    description: 'Moonshot AI. Vision support, 262K context.',
    caps: ['image'],
  },
  // ─ STANDAR ────────────────────────────────────────────────
  'bytedance-seed/seed-2.0-lite': {
    name: 'Seed 2.0 Lite',
    costTier: 'standar',
    description: 'ByteDance. Vision + video, 262K context.',
    caps: ['image', 'video'],
  },
  'qwen/qwen3.5-397b-a17b': {
    name: 'Qwen 3.5 397B',
    costTier: 'standar',
    description: 'Qwen terbesar. Vision + video, 262K context.',
    caps: ['image', 'video'],
  },
  'deepseek/deepseek-r1': {
    name: 'DeepSeek R1',
    costTier: 'standar',
    description: 'Reasoning specialist. Untuk analisis mendalam.',
  },
  'mistralai/mistral-large-2512': {
    name: 'Mistral Large',
    costTier: 'standar',
    description: 'Flagship Mistral. 262K context, cerdas & efisien.',
    caps: ['image'],
  },
  'xiaomi/mimo-v2-pro': {
    name: 'MiMo V2 Pro',
    costTier: 'standar',
    description: 'Xiaomi. Text-only, kuat untuk coding.',
  },
  'google/gemini-3-flash-preview': {
    name: 'Gemini 3 Flash Preview',
    costTier: 'standar',
    description: 'Gemini generasi 3. 1M context, semua media.',
    caps: ['image', 'audio', 'video', 'file'],
  },
  'openai/o4-mini': {
    name: 'o4 Mini',
    costTier: 'standar',
    description: 'OpenAI reasoning model. Pintar analisis & logika.',
    caps: ['image'],
  },
  'openai/gpt-4o': {
    name: 'GPT-4o',
    costTier: 'standar',
    description: 'Flagship OpenAI. Cepat & sangat cerdas.',
    caps: ['image', 'file'],
  },
  'openai/gpt-4.1': {
    name: 'GPT-4.1',
    costTier: 'standar',
    description: 'Generasi terbaru GPT-4. 1M context.',
    caps: ['image', 'file'],
  },
  'google/gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    costTier: 'standar',
    description: 'Reasoning kuat dari Google. 1M context.',
    caps: ['image', 'audio', 'video', 'file'],
  },
  // ─ PREMIUM ────────────────────────────────────────────────
  'openai/gpt-5.1': {
    name: 'GPT-5.1',
    costTier: 'premium',
    description: 'Next-gen GPT. Terpintar untuk tugas kompleks.',
    caps: ['image', 'file'],
  },
  'openai/gpt-5': {
    name: 'GPT-5',
    costTier: 'premium',
    description: 'Flagship OpenAI. 400K context.',
    caps: ['image', 'file'],
  },
  'google/gemini-3.1-pro-preview': {
    name: 'Gemini 3.1 Pro Preview',
    costTier: 'premium',
    description: 'Gemini terbaru & terkuat. 1M context, semua media.',
    caps: ['image', 'audio', 'video', 'file'],
  },
  'x-ai/grok-4': {
    name: 'Grok 4',
    costTier: 'premium',
    description: 'Flagship xAI. 256K context, coding expert.',
    caps: ['image'],
  },
}

// ─────────────────────────────────────────────────────────
// Referral
// ─────────────────────────────────────────────────────────
export const REFERRAL_COMMISSION_RATE = 0.10  // 10% lifetime
export const REFERRAL_MAX_REWARD_IDR = 500_000

// ─────────────────────────────────────────────────────────
// Grace Period & Lifecycle
// ─────────────────────────────────────────────────────────
export const GRACE_PERIOD_DAYS = 10
export const REMINDER_DAYS = [3, 7, 9]  // days into grace period to send reminder

// ─────────────────────────────────────────────────────────
// Startup Environment Validation
// ─────────────────────────────────────────────────────────

/**
 * Required server-side environment variables.
 * Called at startup to fail fast rather than fail silently.
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[BikinBot] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
    )
  }
}

// ─────────────────────────────────────────────────────────
// Skill Registry Paths
// ─────────────────────────────────────────────────────────
export const SKILL_PATHS = {
  clawdefender: '/root/bikinbot/skills/clawdefender',
  skillVetting: '/root/bikinbot/skills/skill-vetting',
  selfReflection: '/root/bikinbot/skills/self-reflection',
  autoBackup: '/opt/bikinbot/app/bikinbot-platform/skills/auto-backup',
  morningRoutine: '/opt/bikinbot/app/bikinbot-platform/skills/morning-routine',
  autoUpdate: '/opt/bikinbot/app/bikinbot-platform/skills/auto-update',
  proactiveBehaviors: '/opt/bikinbot/app/bikinbot-platform/skills/proactive-behaviors',
  seo: '/root/bikinbot/skills/seo',
  typescript: '/root/bikinbot/skills/typescript',
  testingPatterns: '/root/bikinbot/skills/testing-patterns',
} as const

// --- Added during Phase 3 centralization ---
export const CONTABO_PASSWORD = process.env.CONTABO_PASSWORD || ''
export const ADMIN_KEY = process.env.ADMIN_KEY || ''
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
