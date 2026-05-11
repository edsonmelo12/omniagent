# Render Compliance Card — AC-30-29

## Render Summary

- Asset: AC-30-29
- Client: AmiClube
- Format: Instagram Stories sequence, 3 frames
- Canvas: 1080x1920 px per frame
- Skill: `stories-sequence` applied from VDC specification
- Visual style: Minimalist Texture + Organic Image-led
- Source VDC: `squads/social-growth/output/amiclube/social/ac-30-29-vdc.md`
- Source image: `squads/social-growth/output/amiclube/blog/assets/AC-30-13B-home-office-hero.jpg`

## Files

- Preview aggregate: `squads/social-growth/output/amiclube/social/previews/ac-30-29.html`
- Individual export redirects: `ac-30-29-s1.html`, `ac-30-29-s2.html`, `ac-30-29-s3.html`
- PNG frame 1: `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-01.png`
- PNG frame 2: `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-02.png`
- PNG frame 3: `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-03.png`

## Copy Sync

- Frame 1: “Qual estilo combina mais?” + “Mesa” + “Estante”
- Frame 2: “O artigo mostra onde cada opção funciona melhor: mesa, estante ou fundo de câmera.”
- Frame 3: “Vote!” + “Mande a opção no Direct”
- pt-BR diacritics checked in HTML source before export.

## Export Method

- Tool: Playwright + `/usr/bin/google-chrome`, headless.
- Method: opened `ac-30-29.html?export=1&frame=N`, viewport `1080x1920`, screenshot of `.viewport` only.
- Final PNGs exclude preview controls, browser chrome, social mock UI, footer, metadata blocks and compliance text.
- Reviewer correction: progress bars removed from final PNGs via export-only CSS hiding `.progress`.
- Preview mode constrained for campaign hub; export mode unchanged.

## Validation Evidence

### Dimensions and File Size

`identify -format '%f %wx%h %b\n' ...`

```text
ac-30-29-01.png 1080x1920 1.60744MB
ac-30-29-02.png 1080x1920 1.57062MB
ac-30-29-03.png 1080x1920 1.45556MB
```

`stat -c '%n %s bytes' ...`

```text
squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-01.png 1607439 bytes
squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-02.png 1570625 bytes
squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-03.png 1455559 bytes
```

All PNGs are exactly `1080x1920` and above the 50KB content threshold.

### Preview Navigation

Playwright navigation check result:

```json
{"frames":3,"before":"1 / 3","afterNext":"2 / 3","afterPrev":"1 / 3"}
```

The aggregate preview has exactly 3 frames, one visible at a time, with external previous/next controls and progress dots outside the artwork.

## Compliance Checks

- Uses hero image as full-bleed atmospheric background with warm overlay and varied crop per frame.
- Main content is vertically centered inside Stories safe areas.
- Minimum in-art text size is above 42 px in final canvas CSS.
- No arrows inside the artwork.
- No progress bars in the exported final PNGs.
- No Instagram/social network mock UI.
- No vertically stacked slides in final preview.
- No invented URL or public link in the render.
- Warm, human, artisanal and useful AmiClube DNA preserved.
- Campaign hub updated to `social/previews/ac-30-29.html`.

## Notes

- No local standalone `stories-sequence` skill file was found in the workspace; execution followed the VDC's complete `stories-sequence` production contract.
