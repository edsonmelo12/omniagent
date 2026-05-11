# Visual Decision Card — AC-30-20 v4

## Asset Info

- **Asset ID:** AC-30-20
- **Channel / Format:** Instagram / Stories
- **Visual Skill:** stories-sequence
- **Final Canvas:** 1080x1920
- **Frames:** 5
- **Campaign-Hub Preview:** 360x640px, scale-down fit, no clipping, keyboard/dot navigation
- **Preview canônico:** `social/previews/ac-30-20-v4-stories.html`
- **Blog Parent:** AC-30-01B — Saúde e Bem-Estar: Ergonomia

## Decisão Visual

- **Style Selected:** Organic Image-led
- **Client DNA Acceptance:** ALLOWED — Organic Image-led está na lista `allowed` do `creative-dna-acceptance.json`
- **Baseline / Reference:** `social/previews/ac-30-20-v3-stories.html` (v3 prev — usado como referência de estrutura, mas com correções de conformidade)
- **Composition Logic:** image-led — hero image de blog como background com gradiente suave de escurecimento vertical
- **Recent Assets Checked:** AC-30-19 (Instagram Post, single image, #2A2A2A bg), AC-30-34 (Facebook Post, single image, #2A2A2A bg), AC-30-03 (Instagram Carrossel, 4 slides, image-led)
- **Opening Image / Crop:** `AC-30-01b-saude-bem-estar-hero.jpg` — crop centralizado no amigurumi, focal point no produto, com gradiente overlay
- **First Impression Role:** image-led com warmth visual
- **Difference From Recent Assets:** composição 9:16 vertical (vs 4:5/1.91:1 dos recentes), gradiente mais intenso no fundo, tipografia Playfair Display em headline maior, ausência de cards/blocos (story flow puro)
- **Similarity Risk:** MEDIUM
- **Continuity Justification:** mesma estrutura stories da v3, mas composição vertical 9:16 difere radicalmente dos posts feed 4:5 e 1.91:1 publicados recentemente. Gradiente, tipografia e ritmo visual são distintos.
- **Background Image Decision:** background-image
- **Background Image Source:** `squads/social-growth/output/amiclube/blog/assets/AC-30-01b-saude-bem-estar-hero.jpg` — Verified: arquivo existe no catálogo de blog assets
- **Image Treatment:** object-fit cover, central crop, gradiente overlay de 20% topo → 90% base, rotação sutil (3deg) para dinamismo visual
- **Typography:** Playfair Display 700 (headline, 32px/26px), DM Sans 400/700 (body, 16px–18px)
- **Minimum Font Size:** 16px (body text no canvas 1080x1920)
- **Palette:** #2A2A2A (dark bg), #D4A574 (warm accent), #FFFFFF (light text), #1A1A1A (dark text on accent bg)
- **CTA Treatment:** Frame 5 com fundo #D4A574, headline #1A1A1A, botão com background #1A1A1A e texto #D4A574
- **Navigation / Interaction:** Dots na base (não setas), keyboard arrows, swipe touch. SEM setas de navegação dentro da arte. SEM mock de publicação real (sem avatar, username, ⋯). SEM progress bar de story.
- **Export Expectation:** 5 PNGs em `social/publish/ac-30-20/` (ac-30-20-01 a 05), 1080x1920 cada
- **Validation Method:** `file` command para confirmar 1080x1920; `verify-html-png-sync.mjs` para sync; `export-social-publish-assets.mjs` para export

## Estrutura

| Frame | Conteúdo | Função |
|-------|----------|--------|
| 1 | "Conforto também é critério." / "Avalie na escala de 1 a 5." | Hook |
| 2 | "Nível 1–2" / Toque áspero + Firmeza inconsistente | Educação |
| 3 | "Nível 3–4" / Consistente sem atenção ao uso + Confortável no dia a dia | Educação |
| 4 | "Nível 5" / Conforto claro, decisão segura | Educação |
| 5 | "Quer ajuda para avaliar?" / "Curadoria gratuita no direct." + Botão CTA | CTA |

## Correções da v3 → v4

1. **"gratuite" → "gratuita"** — ortografia pt-BR correta
2. **Removidas setas de navegação** (`.nav-arrow`) — violação de regra do briefing
3. **Removidos mock elements** (`.story-user`, `.story-username`, `.story-avatar`, `.story-more`) — sem simulação de publicação real
4. **Removidas progress bars** inline por story — não é UI nativa de stories no contexto de design
5. **Adicionado `.frame-wrapper` e `.frame-container`** — compatibilidade com `export-social-publish-assets.mjs`
6. **Rotação sutil (3deg) na imagem de background** — dinamismo visual conforme briefing
7. **Copy enriquecida** nos frames de escala — mais específica ao tema ergonomia/conforto
8. **Link sticker visual** no frame 5 — link para o artigo do blog

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Visual Director | creative-director | `skills/creative-director/SKILL.md` | AC-30-20 v4 | Seleção de direção Organic Image-led, anti-repetition, FID | invoked |
| Visual Director | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-20 v4 | Regras de Stories, CTA, pt-BR, export/review separation | invoked |
| Visual Director | stories-sequence | `skills/stories-sequence/SKILL.md` | AC-30-20 v4 | Estrutura 5 frames 9:16, safe areas, CTA obrigatório | invoked |
| Visual Director | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-20 v4 | Gate de produção visual completo | invoked |
