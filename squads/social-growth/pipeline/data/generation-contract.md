# Social Generation Contract

## Purpose

This is the single checklist for social asset generation in Social Growth Squad.
It prevents drift between brief, visual direction, render, review, preview and export.

If a required field is missing, the asset is `BLOCKED` until corrected.

## Canonical Composition Rule

- The asset manifest is the source of truth for composition decisions.
- Preview HTML and exported PNGs must be derived from the manifest, not from manual visual overrides.
- Any divergence between manifest, preview and export is a blocking inconsistency.
- NotebookLM prototypes, when used, are reference inputs only. They are never the composition source of truth.

## Regeneration Procedure

- If a recreated post changes its background image, crop, dimensions, or preview source, the responsible agent must regenerate the canonical preview HTML first and then re-export the PNGs from that updated preview.
- After any preview or export regeneration, update the canonical JSON chain that feeds the hub: `campaign-manifest.json`, `social-publish-assets.json`, `social-final-captions.json`, and the editorial backlog when the status changes.
- The campaign hub and review modal are derived artifacts; they must be regenerated after the canonical JSON chain changes.
- Do not treat VDC/RCC updates as sufficient evidence of completion when the preview HTML or exported PNGs still reference an older image.

## Canonical Checklist

### 1. Identity and Routing

- Asset ID
- Client
- Source type
- Destination channel
- Format
- Route mode
- Stage owner
- Parent source / upstream asset, when applicable
- Required visual skill

### 2. Creative Decision

- Selected style
- Client DNA acceptance status
- Baseline / reference
- NLM prototype reference, when used
- First impression role
- Opening image / crop
- Background decision
- Typography family
- Minimum font size
- Typography by level: title, body, caption and CTA sizes
- Palette
- CTA treatment
- Navigation behavior

## Background and Readability Rule

- Slide 1 may use `background-image` when the image supports the thesis.
- Slides 2+ must declare `texture-only`, `gradient` or `solid` explicitly.
- Slides 2+ must not fall back to an undifferentiated flat background unless that choice is declared and justified.
- Secondary text must remain readable at export size; if the body or caption copy is hard to scan, increase type size or shorten the copy before approval.

### 3. Caption and Link

- Caption source
- Caption integrity
- Platform CTA
- Article URL or other destination URL, when applicable
- Link strategy
- pt-BR copy with correct diacritics

#### Caption Formatting Rules

- **Hook pattern-interrupt**: primeira linha deve abrir com um emoji-símbolo (✨, 🔥, 💡, etc.) e a mensagem central em CAPS LOCK, criando uma quebra de padrão no feed.
- **Escaneabilidade visual**: parágrafos de no máximo 2 linhas, separados por linha em branco. Cada bloco de idéia deve usar um emoji temático como marcador visual (🎁, 🏠, 👶, 💼).
- **Estrutura de argumento**: usar formato pergunta-resposta ou tese-evento nos blocos intermediários para manter ritmo de leitura.
- **CTA com verbo de ação**: última linha antes das hashtags deve conter um call-to-action direto com verbo no imperativo ("Comenta aqui", "Salva este post", "Compartilha com quem").
- **Hashtags isoladas**: hashtags devem vir após uma linha em branco, separadas do corpo do texto.
- **Limite de caracteres**: máximo 2200 caracteres (limite do Instagram para carrosséis). Legendas com 1800-2100 caracteres são ideais.

### 4. Export and Proof

- Final canvas
- Preview path
- Preview behavior
- Post-preview generated
- Export path
- Export dimensions
- Frame / slide count
- Validation method
- Skill Invocation Ledger
- Known risks
- Prototype limitations, when NLM was used
- Status
- If the asset was recreated with a new image/background, the preview path and export path must point to the regenerated files, not to the prior version.

## Hard Rule

No social asset may move forward unless the checklist is complete and matches the upstream VDC, RCC and preview/export evidence.

NotebookLM-generated PDFs or images may not move directly to publication. If used, they must be translated into the canonical manifest/VDC/RCC path first.
