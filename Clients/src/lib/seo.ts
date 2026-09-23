/** Structured data + meta tags generated from the live site content.
 *
 * The static tags in index.html are the crawler's first impression; these keep everything in sync with
 * whatever is in the dashboard (roles, projects, skills) without a rebuild.
 */
import type { SiteData } from './types'

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export function applySeo(data: SiteData) {
  const s = data.settings, a = data.about
  if (!s || !a) return
  const base = (s.canonical_url || window.location.origin).replace(/\/$/, '')
  const image = s.og_image || a.gallery?.[0] || a.avatar_url || ''
  const title = s.seo_title || `${a.name} — ${a.role}`
  const desc = s.seo_description || a.bio?.[0] || ''

  document.title = title
  upsertMeta('meta[name="description"]', 'name', 'description', desc)
  upsertMeta('meta[name="keywords"]', 'name', 'keywords', s.seo_keywords)
  upsertMeta('meta[name="author"]', 'name', 'author', a.name)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', desc)
  upsertMeta('meta[property="og:image"]', 'property', 'og:image', image)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', base + '/')
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc)
  upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
  canonical.href = base + '/'

  // ── JSON-LD: Person + the organisations, projects and skills that make the entity searchable ──
  const employers = (a.currently ?? []).map(c => ({
    '@type': 'Organization', name: c.org, ...(c.url ? { url: c.url } : {}),
  }))
  const skills = (data.skills ?? []).flatMap(c => c.skills.map(x => x.name))
  const featured = (data.projects ?? []).filter(p => p.featured)
  const education = (data.education ?? [])[0]

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': `${base}/#person`,
      name: a.name,
      alternateName: [s.logo_text, 'lscblack', 'Christian Loue Sauveur'].filter(Boolean),
      url: base,
      ...(image ? { image: { '@type': 'ImageObject', url: image } } : {}),
      ...(a.email ? { email: a.email } : {}),
      ...(a.phone ? { telephone: a.phone.replace(/\s/g, '') } : {}),
      jobTitle: a.role,
      description: desc,
      ...(employers.length ? { worksFor: employers } : {}),
      ...(education ? { alumniOf: { '@type': 'CollegeOrUniversity', name: education.org } } : {}),
      knowsAbout: Array.from(new Set([...skills, ...(data.interests ?? []).map(i => i.title)])).slice(0, 40),
      ...(a.languages?.length ? { knowsLanguage: a.languages } : {}),
      ...(a.location ? {
        address: { '@type': 'PostalAddress', addressLocality: a.location.split(',')[0]?.trim(), addressCountry: a.location.split(',').pop()?.trim() },
        homeLocation: { '@type': 'Place', name: a.location },
      } : {}),
      sameAs: (s.social_links ?? []).map(l => l.url).filter(u => u.startsWith('http')),
      hasOccupation: { '@type': 'Occupation', name: a.role, ...(a.location ? { occupationLocation: { '@type': 'City', name: a.location.split(',')[0]?.trim() } } : {}) },
    },
    {
      '@type': 'WebSite', '@id': `${base}/#website`, url: base, name: s.site_name,
      description: desc, inLanguage: 'en', author: { '@id': `${base}/#person` },
    },
    {
      '@type': 'ProfilePage', '@id': `${base}/#profilepage`, url: base, name: title,
      isPartOf: { '@id': `${base}/#website` }, about: { '@id': `${base}/#person` }, mainEntity: { '@id': `${base}/#person` },
    },
  ]
  if (featured.length) {
    graph.push({
      '@type': 'ItemList', name: `Projects by ${a.name}`,
      itemListElement: featured.map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: {
          '@type': 'CreativeWork', name: p.title, description: p.description,
          ...(p.live_url || p.github_url ? { url: p.live_url || p.github_url } : {}),
          ...(p.technologies?.length ? { keywords: p.technologies.join(', ') } : {}),
          author: { '@id': `${base}/#person` },
        },
      })),
    })
  }

  let ld = document.getElementById('site-jsonld') as HTMLScriptElement | null
  if (!ld) { ld = document.createElement('script'); ld.id = 'site-jsonld'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}
