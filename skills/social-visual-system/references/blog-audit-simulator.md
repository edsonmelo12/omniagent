# Omni-Blog-Audit-Simulator

This component is the standard for all blog article previews. It ensures that strategic intelligence is visible alongside the content.

## Layout Standard

```css
body {
    display: grid;
    grid-template-areas: "shield shield" "article audit";
    grid-template-columns: 1fr 350px;
    grid-template-rows: auto 1fr;
    min-height: 100vh;
}

.shield-zone { grid-area: shield; }
.article-zone { grid-area: article; padding: 40px; background: #f4f4f5; }
.audit-zone { grid-area: audit; padding: 24px; background: #09090b; color: #e4e4e7; border-left: 1px solid #27272a; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
```

## Audit Sidebar Sections

1.  **Identity:** Slug, Meta Description, Excerpt.
2.  **SEO Check:** 
    *   Focus Keyword (Presence in H1, P1, Meta).
    *   Internal/External Link count.
3.  **GEO & Entities:** List of location-based or authority entities (e.g., "AmiClube", "Artesanato Premium", "Mercado de Amigurumi").
4.  **Readability:** Transition word density (%) and Paragraph length check.
5.  **Image Audit:** Featured image Alt-Text and Description.

## Implementation Rules

1.  **Sidebar is Administrative:** It must not contain creative styling. Use mono-spaced fonts for technical data.
2.  **Two-Column Flow:** The article remains the hero of the page, but the audit provides the "Strategic Proof".
3.  **Real-Time Simulation:** If possible, calculate word counts and keyword presence dynamically in the HTML template.
4.  **Zero Placeholder:** The article zone must contain ONLY final publishable content.
