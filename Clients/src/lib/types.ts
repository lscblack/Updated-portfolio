export type ThemeTones = { bg: string; surface: string; surface2: string; fg: string; muted: string; line: string }
export type Theme = {
  preset?: string
  accent: string
  accent2: string
  radius: number
  dark: ThemeTones
  light: ThemeTones
  default_mode?: 'dark' | 'light' | 'system'
}
export type Fonts = { display: string; body: string; mono: string }
export type Effects = {
  preloader?: boolean; cursor_glow?: boolean; grain?: boolean; particles?: boolean
  marquee?: boolean; walker?: boolean; smooth_reveal?: boolean
}
export type SectionCfg = { key: string; label: string; visible: boolean }
export type SectionTitle = { label?: string; title?: string; subtitle?: string }

export type SiteSettings = {
  id?: number
  site_name: string; logo_text: string
  seo_title: string; seo_description: string; seo_keywords: string; canonical_url: string; og_image: string
  hero_kicker: string; hero_phrases: string[]; hero_intro: string
  hero_primary_label: string; hero_primary_href: string; hero_secondary_label: string; hero_secondary_href: string
  resume_url: string; availability_text: string; available: boolean
  metrics: { value: string; label: string; sub?: string }[]
  marquee: string[]
  live_sites: { label: string; url: string }[]
  social_links: { label: string; url: string; icon: string }[]
  sections: SectionCfg[]
  section_titles: Record<string, SectionTitle>
  contact_intro: string; footer_text: string
  theme: Theme; fonts: Fonts; effects: Effects
}

export type About = {
  id?: number
  name: string; role: string; headline: string; headline_highlight: string
  bio: string[]; quote: string; email: string; phone: string; location: string; avatar_url: string; gallery: string[]
  open_to: string[]; currently: { role: string; org: string; url?: string }[]
  languages: string[]; facts: { label: string; value: string }[]
}

export type Milestone = {
  id?: number; year: string; title: string; subtitle: string; description: string
  kind: 'education' | 'work' | 'project' | 'award' | 'life' | string
  icon: string; location: string; link: string; tags: string[]; order: number; visible: boolean
}
export type Experience = {
  id?: number; title: string; company: string; company_url: string; location: string; period: string
  job_type: string; summary: string; bullets: string[]; tags: string[]; logo_url: string; current: boolean
  order: number; visible: boolean
}
export type SkillCategory = {
  id?: number; name: string; icon: string
  skills: { name: string; level: number }[]; applied: { name: string; url?: string }[]
  order: number; visible: boolean
}
export type Project = {
  id?: number; title: string; slug: string; description: string; role: string; year: string
  featured: boolean; public: boolean; github_url: string; live_url: string; image_url: string
  technologies: string[]; categories: string[]; highlights: string[]; status: string; order: number
}
export type Education = {
  id?: number; period: string; kind: string; title: string; subtitle: string; org: string; location: string
  note: string; tags: string[]; url: string; status: string; order: number; visible: boolean
}
export type Certification = { id?: number; title: string; issuer: string; grade: string; year: string; url: string; order: number; visible: boolean }
export type Activity = { id?: number; label: string; icon: string; quote: string; media_url: string; media_kind: 'image' | 'video' | string; caption: string; order: number; visible: boolean }
export type Interest = { id?: number; title: string; icon: string; items: string[]; order: number; visible: boolean }

export type SiteData = {
  settings: SiteSettings; about: About; journey: Milestone[]; experience: Experience[]
  skills: SkillCategory[]; projects: Project[]; education: Education[]; certifications: Certification[]
  activities: Activity[]; interests: Interest[]; generated_at?: string
}

export type ContactMessage = {
  id: number; name: string; email: string; subject: string; message: string; user_agent: string
  read: boolean; starred: boolean; created_at: string
}
export type Offer = {
  id: number; name: string; email: string; company: string; website: string; kind: string; title: string
  budget: string; timeline: string; message: string; status: 'new' | 'reviewing' | 'accepted' | 'declined'; notes: string
  user_agent: string; read: boolean; starred: boolean; created_at: string; updated_at: string
}
export type Notification = { id: number; kind: string; title: string; body: string; link: string; ref_id: number | null; read: boolean; created_at: string }
export type AuditEntry = { id: number; admin_id: number | null; action: string; target: string; detail: Record<string, unknown> | null; created_at: string }
export type UploadItem = { id: number; filename: string; original_name: string; content_type: string; size: number; width?: number; height?: number; url: string; created_at: string }
