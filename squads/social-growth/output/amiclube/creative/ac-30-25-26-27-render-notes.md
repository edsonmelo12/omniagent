# Render Notes - AC-30-25/26/27

Agente: Creative Renderer
Data: 2026-04-30

## Arquivos gerados

- AC-30-25 preview: `output/amiclube/social/previews/AC-30-25.html`
- AC-30-26 preview: `output/amiclube/social/previews/ac-30-26-reels.html`
- AC-30-27 preview: `output/amiclube/social/previews/ac-30-27-facebook.html`
- AC-30-25 exports: `output/amiclube/social/publish/ac-30-25/` (6 PNGs)
- AC-30-26 exports: `output/amiclube/social/publish/ac-30-26/` (4 PNGs)
- AC-30-27 export: `output/amiclube/social/publish/ac-30-27/ac-30-27-01.png`

## Técnica

- Canvas final fixo por formato: carrossel `1080x1350`, reels `1080x1920`, Facebook `1200x630`.
- Modo de revisão por `?preview=1` com escala responsiva.
- AC-30-25 e AC-30-26 têm controles anterior/próximo, dots e teclado.
- AC-30-27 é single-frame; navegação não aplicável.
- Imagem do artigo-pai usada como background ativo com scrim escuro, sem duplicação como miniatura.

## Validação executada

- `identify -format '%f %wx%h\n' ...` confirmou:
  - `ac-30-25-01.png 1080x1350`
  - `ac-30-25-06.png 1080x1350`
  - `ac-30-26-01.png 1080x1920`
  - `ac-30-26-04.png 1080x1920`
  - `ac-30-27-01.png 1200x630`
- Playwright confirmou `preview=1` ativo e navegação funcional em AC-30-25 e AC-30-26.
- `validate-social-publish-assets.mjs --client amiclube` retornou `ok: true`, `failures: []`.
- `verify-campaign-hub.mjs` retornou todos os assets do manifest presentes no hub.
- `build-social-publish-queue.mjs --client amiclube --default-time 10:00` retornou `status: OK`.
- `monitor-social-publish-queue.mjs --client amiclube --grace-minutes 90` retornou `status: OK`, critical `0`, warning `0`.

## Visual Evidence

- Asset: AC-30-25
- Status: ready for review
- Creative decision: carrossel de descoberta com tese de luxo sensorial.
- Format skill: instagram-carousel
- Visual style: Dark Premium + Minimalist Texture
- Baseline/reference: `output/amiclube/blog/previews/AC-30-05b-veludo-luxo.html`
- Baseline status: verified
- Source image/path/URL: `output/amiclube/blog/assets/AC-30-05b-veludo-luxo-hero.jpg`
- Source/license status: verified
- Export path: `output/amiclube/social/publish/ac-30-25/`
- Export dimensions: 1080x1350, verified with `identify`
- Preview path: `output/amiclube/social/previews/AC-30-25.html?preview=1`
- Preview behavior: responsive review mode with frame navigation
- Multi-frame navigation: yes
- Validation method: Playwright navigation check + ImageMagick `identify` + social publish validator
- Reviewer verdict/path: `output/amiclube/review/ac-30-25-26-27-review-verdict.md`
- Known risks: none open

## Visual Evidence

- Asset: AC-30-26
- Status: ready for review
- Creative decision: sequência vertical com macro textura e CTA "TOQUE".
- Format skill: stories-sequence
- Visual style: Motion Social + Dark Premium
- Baseline/reference: `output/amiclube/blog/previews/AC-30-05b-veludo-luxo.html`
- Baseline status: verified
- Source image/path/URL: `output/amiclube/blog/assets/AC-30-05b-veludo-luxo-hero.jpg`
- Source/license status: verified
- Export path: `output/amiclube/social/publish/ac-30-26/`
- Export dimensions: 1080x1920, verified with `identify`
- Preview path: `output/amiclube/social/previews/ac-30-26-reels.html?preview=1`
- Preview behavior: responsive review mode with frame navigation
- Multi-frame navigation: yes
- Validation method: Playwright navigation check + ImageMagick `identify` + social publish validator
- Reviewer verdict/path: `output/amiclube/review/ac-30-25-26-27-review-verdict.md`
- Known risks: none open

## Visual Evidence

- Asset: AC-30-27
- Status: ready for review
- Creative decision: post horizontal de autoridade com prova de categoria.
- Format skill: social-single-post
- Visual style: Dark Premium + Editorial Magazine
- Baseline/reference: `output/amiclube/blog/previews/AC-30-05b-veludo-luxo.html`
- Baseline status: verified
- Source image/path/URL: `output/amiclube/blog/assets/AC-30-05b-veludo-luxo-hero.jpg`
- Source/license status: verified
- Export path: `output/amiclube/social/publish/ac-30-27/ac-30-27-01.png`
- Export dimensions: 1200x630, verified with `identify`
- Preview path: `output/amiclube/social/previews/ac-30-27-facebook.html?preview=1`
- Preview behavior: responsive review mode, single-frame
- Multi-frame navigation: not applicable
- Validation method: ImageMagick `identify` + social publish validator
- Reviewer verdict/path: `output/amiclube/review/ac-30-25-26-27-review-verdict.md`
- Known risks: none open
