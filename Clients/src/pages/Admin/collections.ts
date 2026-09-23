import type { ColumnDef } from './ui/Fields'

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'tags' | 'list' | 'icon' | 'image' | 'objects'
export type FieldDef = { key: string; label: string; type: FieldType; options?: string[]; hint?: string; span?: 1 | 2; columns?: ColumnDef[]; placeholder?: string; multiline?: boolean }
export type CollectionDef = {
  name: string; title: string; singular: string; description: string
  titleKey: string; subtitleKey?: string; badgeKey?: string; imageKey?: string
  blank: Record<string, unknown>; fields: FieldDef[]
}

const CATEGORY_OPTIONS = ['Web', 'Mobile', 'AI / ML', 'Security', 'Open Source', 'Blockchain', 'IoT', 'Research', 'Design']

export const COLLECTIONS: Record<string, CollectionDef> = {
  journey: {
    name: 'journey', title: 'Journey', singular: 'milestone',
    description: 'Milestones the walker passes on the scroll-driven timeline. Order = chronological.',
    titleKey: 'title', subtitleKey: 'subtitle', badgeKey: 'year',
    blank: { year: '', title: '', subtitle: '', description: '', kind: 'work', icon: 'Flag', location: '', link: '', tags: [], visible: true },
    fields: [
      { key: 'year', label: 'Year / date', type: 'text', placeholder: 'Mar 2024' },
      { key: 'kind', label: 'Kind', type: 'select', options: ['education', 'work', 'project', 'award', 'life'] },
      { key: 'title', label: 'Title', type: 'text', span: 2 },
      { key: 'subtitle', label: 'Organisation / subtitle', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'link', label: 'Link', type: 'text', placeholder: 'https://' },
      { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  experience: {
    name: 'experience', title: 'Experience', singular: 'role',
    description: 'Work history. The first item appears expanded by default.',
    titleKey: 'company', subtitleKey: 'title', badgeKey: 'period', imageKey: 'logo_url',
    blank: { title: '', company: '', company_url: '', location: '', period: '', job_type: 'Full-time', summary: '', bullets: [], tags: [], logo_url: '', current: false, visible: true },
    fields: [
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'title', label: 'Job title', type: 'text' },
      { key: 'company_url', label: 'Company URL', type: 'text', placeholder: 'https://' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'period', label: 'Period', type: 'text', placeholder: 'May 2025 – Present' },
      { key: 'job_type', label: 'Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Leadership', 'Volunteer'] },
      { key: 'summary', label: 'Summary', type: 'textarea', span: 2 },
      { key: 'bullets', label: 'Highlights', type: 'list', span: 2, multiline: true },
      { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
      { key: 'logo_url', label: 'Logo', type: 'image' },
      { key: 'current', label: 'Current role', type: 'boolean' },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  skills: {
    name: 'skills', title: 'Skills', singular: 'category',
    description: 'Skill categories with proficiency (0–100) and the projects where each was applied.',
    titleKey: 'name', badgeKey: 'icon',
    blank: { name: '', icon: 'Code2', skills: [], applied: [], visible: true },
    fields: [
      { key: 'name', label: 'Category name', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'skills', label: 'Skills', type: 'objects', span: 2, columns: [{ key: 'name', label: 'Skill' }, { key: 'level', label: 'Level %', type: 'number', width: '110px', min: 0, max: 100 }] },
      { key: 'applied', label: 'Applied in', type: 'objects', span: 2, columns: [{ key: 'name', label: 'Project' }, { key: 'url', label: 'URL (optional)', type: 'url' }] },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  projects: {
    name: 'projects', title: 'Projects', singular: 'project',
    description: 'Featured projects get large cards; the rest appear in the filterable list.',
    titleKey: 'title', subtitleKey: 'role', badgeKey: 'year', imageKey: 'image_url',
    blank: { title: '', slug: '', description: '', role: '', year: '', featured: false, public: true, github_url: '', live_url: '', image_url: '', technologies: [], categories: [], highlights: [], status: 'production' },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'role', label: 'Your role', type: 'text', placeholder: 'Lead engineer' },
      { key: 'status', label: 'Status', type: 'select', options: ['production', 'beta', 'archived', 'in progress', 'research'] },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
      { key: 'live_url', label: 'Live URL', type: 'text', placeholder: 'https://' },
      { key: 'github_url', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/' },
      { key: 'image_url', label: 'Cover image', type: 'image', span: 2, hint: 'Optional — featured cards get a generated gradient when empty' },
      { key: 'technologies', label: 'Technologies', type: 'tags', span: 2 },
      { key: 'categories', label: 'Categories', type: 'tags', span: 2, options: CATEGORY_OPTIONS },
      { key: 'highlights', label: 'Highlights (featured cards)', type: 'list', span: 2 },
      { key: 'featured', label: 'Featured', type: 'boolean' },
      { key: 'public', label: 'Public', type: 'boolean' },
    ],
  },
  education: {
    name: 'education', title: 'Education', singular: 'qualification',
    description: 'Degrees and diplomas.',
    titleKey: 'title', subtitleKey: 'org', badgeKey: 'period',
    blank: { period: '', kind: 'degree', title: '', subtitle: '', org: '', location: '', note: '', tags: [], url: '', status: '', visible: true },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Specialisation', type: 'text' },
      { key: 'org', label: 'Institution', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'kind', label: 'Kind', type: 'select', options: ['degree', 'diploma', 'bootcamp', 'course'] },
      { key: 'status', label: 'Status', type: 'text', placeholder: 'In progress' },
      { key: 'url', label: 'Link', type: 'text' },
      { key: 'note', label: 'Note', type: 'textarea', span: 2 },
      { key: 'tags', label: 'Tags', type: 'tags', span: 2 },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  certifications: {
    name: 'certifications', title: 'Certifications', singular: 'certificate',
    description: 'Courses and certificates with optional proof links.',
    titleKey: 'title', subtitleKey: 'issuer', badgeKey: 'grade',
    blank: { title: '', issuer: '', grade: '', year: '', url: '', visible: true },
    fields: [
      { key: 'title', label: 'Title', type: 'text', span: 2 },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'grade', label: 'Grade', type: 'text', placeholder: '100%' },
      { key: 'url', label: 'Certificate link', type: 'text' },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  activities: {
    name: 'activities', title: 'Life beyond code', singular: 'activity',
    description: 'Hobbies and values. Add a photo or short clip of you doing each one — the site reveals it as visitors scroll.',
    titleKey: 'label', subtitleKey: 'quote', badgeKey: 'icon',
    blank: { label: '', icon: 'Sparkles', quote: '', media_url: '', media_kind: 'image', caption: '', visible: true },
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'quote', label: 'Quote', type: 'textarea', span: 2 },
      { key: 'media_url', label: 'Photo or clip of you doing it', type: 'image', span: 2, hint: 'Shown full-bleed beside the text. Upload a photo, or paste the URL of a short muted clip (.mp4/.webm) and set the kind to video.' },
      { key: 'media_kind', label: 'Media kind', type: 'select', options: ['image', 'video'] },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
  interests: {
    name: 'interests', title: 'Interests', singular: 'interest',
    description: 'Topics you read, research and build toward.',
    titleKey: 'title', badgeKey: 'icon',
    blank: { title: '', icon: 'Compass', items: [], visible: true },
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'icon' },
      { key: 'items', label: 'Points', type: 'list', span: 2 },
      { key: 'visible', label: 'Visible on the site', type: 'boolean', span: 2 },
    ],
  },
}
