# GEO / AI Discoverability Summary — AmiClube

## Canonical Source of Truth
- URL/Page: https://amiclube.com.br (homepage), https://amiclube.com.br/catalogo-de-produtos (product catalog)

The homepage serves as the primary entry point. It clearly communicates "amigurumi patterns & video lessons" as the core offering but requires scrolling to reveal the digital nature of products. No dedicated "About" page exists (returns 404).

## Entity & Offer Clarity
- **Scored: 65/100**
- The site clearly states it's about amigurumi: "O Amiclube é um espaço criado pensando nos amantes de amigurumis, aqui você encontra receitas e video aulas"
- Founder (Sara Melo) is introduced on the homepage with personal backstory
- However, the core offering — **digital PDF patterns**, not physical amigurumi dolls — is not immediately obvious from the hero section. Users/AI must scroll to the catalog to discover this
- The value proposition "certified safety + ergonomics" from the client record is NOT prominently stated on the homepage; it appears only as a blog post topic, not as a core differentiator
- Business entity is informal (Sara Melo as individual, no CNPJ displayed)
- Copyright year 2023 creates a freshness ambiguity despite active blog posting in 2026

## Answerability
- **Scored: 55/100**
- Blog posts answer specific questions well (e.g., "how to choose amigurumi", "ergonomics", "pricing"), giving AI engines extractable content
- FAQ page exists (/perguntas-frequentes) but covers only 5 logistics questions — no FAQ schema, no product-specific FAQs
- No clear answer to "who is this for" beyond generic "amigurumi lovers"
- Missing: "what makes AmiClube different", "certification details", "safety standards explained"
- Target audience (parents 30-45, collectors) is not explicitly defined anywhere on the site

## Sourceability & Proof Density
- **Scored: 45/100**
- Blog has substantive content (10+ posts visible, 5 pages of archives) — good source material
- The ergonomics blog post is particularly citeable with a checklist, FAQ, and structured advice
- Critical gaps: no testimonials, no reviews, no case studies, no expert credentials displayed
- No author bio page for Sara Melo (the craftsperson behind the brand)
- 7-day satisfaction guarantee is mentioned but no review aggregation or social proof widgets visible
- External checkout flow (Hotmart, bit.ly links) reduces on-site proof density
- LGPD privacy policy exists — good for trust signals

## Schema Readiness
- **Scored: 10/100**
- No structured data detected on any fetched page
- Missing: Organization schema, Product schema, FAQ schema, Article schema, BreadcrumbList schema, Review schema, Person schema
- This is the most critical gap for GEO — AI engines rely heavily on structured data for direct answers and rich snippets
- WordPress site (inferred from URL patterns) — likely has plugin options for schema but none visible in rendered output

## Retrieval Structure
- **Scored: 55/100**
- Clean URL structure: /catalogo-de-produtos, /categoria/blog/, /contato, /perguntas-frequentes
- Clear navigation with 4 main sections: Home, Receitas, Blog, Contato
- Blog has pagination and categories
- Search function available
- Missing: sitemap visibility, breadcrumb schema (even though breadcrumbs display visually), tag/category hierarchy for blog, internal linking strategy between blog and product pages (most blog CTA just links to /contato)
- No individual product landing pages — all products link to external checkout URLs

## Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Entity clarity | 65/100 | Clear topic but digital-vs-physical ambiguity, no About page |
| Answerability | 55/100 | Blog helps but FAQ is thin, no structured Q&A |
| Sourceability | 45/100 | Good blog depth but zero reviews/testimonials/credentials |
| Schema readiness | 10/100 | No structured data markup of any kind |
| Retrieval structure | 55/100 | Clean URLs and nav, but no sitemap visibility, external checkouts |
| Risk | 50/100 (lower = better) | IP concerns (licensed characters), 404 About page, external checkout, copyright freshness ambiguity |
| **GEO Score** | **50/100** | weighted avg (25% entity + 25% answerability + 20% sourceability + 10% schema + 10% structure + 10% inverted risk) |

## Fix Order (if applicable)
1. **Add structured data (schema markup)** — highest impact: Organization, Product (for each pattern), Article (blog posts), FAQ, BreadcrumbList. This alone could lift GEO score ~15 points.
2. **Create a proper "About" page** — explain who Sara Melo is, her credentials, the safety/ergonomics differentiator, mission, and audience
3. **Add social proof** — testimonials, customer reviews, case studies showing finished amigurumi made from patterns
4. **Clarify the offer on the homepage** — state explicitly that products are digital PDF patterns (not physical dolls) in the hero section
5. **Expand FAQ with product-specific Q&A** — add FAQ schema with structured answers about safety, materials, difficulty levels, who each pattern is for
6. **Fix the copyright year** and add a "last updated" signal to show site activity
7. **Build individual product pages** with descriptions instead of linking directly to external checkouts

## Content Scaling Gate
- Safe to scale content? **No**
- blocking_gate: **true**
- If blocked: what must be fixed first?
  - **Schema readiness** (score 10/100) must be addressed first — without structured data, AI engines cannot reliably extract or cite the site's information, regardless of content volume
  - **Entity clarity** must be resolved — the current ambiguity between "digital patterns" and "physical products" means AI engines may misrepresent what AmiClube sells
  - The **About page gap** (404) is a trust blocker that must be resolved before scaling content

Without these upstream fixes, scaling content would amplify confusion rather than building a reliable GEO presence. Fix schema + About page + offer clarity first, then scale blog content.

## Evidence
- URLs checked:
  - https://amiclube.com.br (homepage)
  - https://amiclube.com.br/catalogo-de-produtos (product catalog)
  - https://amiclube.com.br/contato (contact)
  - https://amiclube.com.br/categoria/blog (blog archive)
  - https://amiclube.com.br/perguntas-frequentes (FAQ)
  - https://amiclube.com.br/politicas-de-privacidade (privacy policy)
  - https://amiclube.com.br/ergonomia-e-cuidados-ao-escolher-amigurumi (blog: ergonomics)
  - https://amiclube.com.br/preco-e-valor-amigurumi-comprar-amigurumi (blog: pricing)
  - https://amiclube.com.br/sobre (About page — 404)
  - https://amiclube.com.br/produtos (products — 404)
- Key findings:
  - Site runs WordPress, Brazilian Portuguese
  - Sells digital crochet patterns (PDF + video), not physical products
  - No schema markup found on any page
  - About page returns 404
  - Products link to external checkouts (Hotmart, bit.ly)
  - Blog is active and produces good content but lacks proof elements
  - Licensed character patterns (Pokemon, Disney, Turma da Monica) pose IP citation risk
  - No CNPJ or formal business registration visible
