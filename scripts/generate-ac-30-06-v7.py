#!/usr/bin/env python3
"""
Regenerate AC-30-06 Instagram Carousel following skills exactly.
- instagram-carousel skill: base64 images as BACKGROUND-IMAGE (not img tags)
- social-visual-system: brand colors, typography, components
- Responsive preview: width: min(420px, calc(100vw - 32px)); aspect-ratio: 1080 / 1350;
"""
import base64
from pathlib import Path

# ── Brand Input (AmiClube) ────────────────────────────────
BRAND_NAME = "AmiClube"
INSTA_HANDLE = "amiclube"
PRIMARY_HEX = "#C45C1F"   # from brand intake / existing assets
LIGHT_BG = "#F7F3EE"     # warm off-white
LIGHT_BORDER = "#E8E0D4" # slightly darker than LIGHT_BG
DARK_BG = "#1A1918"        # near-black with warm tint
BRAND_LIGHT = "#D9A85A"   # primary lightened ~20%
BRAND_DARK = "#8C6A5E"     # primary darkened ~30%

# ── Typography ─────────────────────────────────────────────────
HEADING_FONT = "'Playfair Display', serif"
BODY_FONT = "'DM Sans', sans-serif"

# ── Paths ─────────────────────────────────────────────────────────
PROJECT = Path("/home/edsonrmjunior/Local Sites/omniagent")
PUBLISH_DIR = PROJECT / "squads/social-growth/output/amiclube/social/publish/ac-30-06"
PREVIEW_DIR = PROJECT / "squads/social-growth/output/amiclube/social/previews"
ASSETS_DIR = PROJECT / "squads/social-growth/output/amiclube/blog/assets"

# Ensure dirs
PUBLISH_DIR.mkdir(parents=True, exist_ok=True)

# ── Encode background image as data: URI (for CSS background-image) ──
def encode_image(img_path: Path) -> str:
    if not img_path.exists():
        print(f"WARNING: image not found: {img_path}")
        return ""
    mime = "image/jpeg" if img_path.suffix.lower() in ('.jpg', '.jpeg') else "image/png"
    b64 = base64.b64encode(img_path.read_bytes()).decode()
    return f"data:{mime};base64,{b64}"

# Primary hero image (from VDC)
hero_img_path = ASSETS_DIR / "AC-30-05-preco-valor-hero.jpg"
hero_data_uri = encode_image(hero_img_path)

# ── Helper: progress bar ────────────────────────────────────────
def progress_bar(index, total=7, is_light=True):
    pct = ((index + 1) / total) * 100
    track = "rgba(0,0,0,0.08)" if is_light else "rgba(255,255,255,0.12)"
    fill = PRIMARY_HEX if is_light else "#ffffff"
    counter = "rgba(0,0,0,0.3)" if is_light else "rgba(255,255,255,0.4)"
    return f'''
    <div style="position:absolute;bottom:0;left:0;right:0;padding:16px 28px 20px;z-index:10;display:flex;align-items:center;gap:10px;">
      <div style="flex:1;height:3px;background:{track};border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:{pct}%;background:{fill};border-radius:2px;"></div>
      </div>
      <span style="font-size:11px;color:{counter};font-weight:500;">{index+1}/{total}</span>
    </div>'''.replace('pct', str(pct))

# ── Helper: swipe arrow (right edge, not on last slide) ─────────
def swipe_arrow(is_light=True):
    bg = "rgba(0,0,0,0.06)" if is_light else "rgba(255,255,255,0.08)"
    stroke = "rgba(0,0,0,0.25)" if is_light else "rgba(255,255,255,0.35)"
    return f'''
    <div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,{bg});">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke="{stroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>'''.replace('stroke', stroke)

# ── Helper: escape curly braces for f-string ────────────────
def esc(s):
    return s.replace('{', '{{').replace('}', '}}')

# ── Slide 1: Hook / Cover ──────────────────────────────────────
slide1 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{LIGHT_BG};">
  <div class="bg"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(196,92,31,0.25) 0%,rgba(196,92,31,0.10) 40%,rgba(26,25,24,0.70) 100%);z-index:1;"></div>
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:#fff;">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:{BRAND_LIGHT};margin-bottom:20px;">mitos e verdades</div>
    <h1 style="font-family:{HEADING_FONT};font-size:34px;line-height:0.95;letter-spacing:-0.5px;font-weight:800;max-width:14ch;margin-bottom:16px;text-wrap:balance;">O PREÇO NÃO CONTA SÓZINHO</h1>
    <p style="font-family:{BODY_FONT};font-size:14px;line-height:1.5;color:rgba(255,255,255,0.88);max-width:28ch;">Preço ajuda a iniciar a comparação, mas não responde sozinho o que vale mais para sua ocasião.</p>
    <div style="margin-top:20px;display:flex;gap:8px;">
      <span style="font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(255,255,255,0.12);color:{BRAND_LIGHT};">#mitos</span>
      <span style="font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(255,255,255,0.12);color:{BRAND_LIGHT};">#verdades</span>
    </div>
  </div>
  {progress_bar(0, 7, False)}
</div>''')

# ── Slide 2: Mito 1 ────────────────────────────────────────────
slide2 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{DARK_BG};">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:#fff;">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#fecdd3;margin-bottom:12px;">mito 1</div>
    <div style="background:rgba(220,76,93,0.92);border-radius:16px;padding:16px;border:2px solid rgba(255,255,255,0.2);margin-bottom:16px;">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:8px;">Mito</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#fff;line-height:1.2;text-decoration:line-through;opacity:0.85;">"É premium se for importado"</div>
    </div>
    <div style="background:rgba(15,118,110,0.92);border-radius:16px;padding:16px;border:2px solid rgba(255,255,255,0.2);">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:8px;">Verdade</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#fff;line-height:1.2;">Origem não define qualidade. Artesanato brasileiro de alto nível supera importados.</div>
    </div>
  </div>
  {progress_bar(1, 7, False)}
  {swipe_arrow(False)}
</div>''')

# ── Slide 3: Mito 2 ────────────────────────────────────────────
slide3 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{LIGHT_BG};">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:{DARK_BG};">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#C45C1F;margin-bottom:12px;">mito 2</div>
    <div style="background:rgba(220,76,93,0.12);border-radius:16px;padding:16px;border:2px solid rgba(220,76,93,0.25);margin-bottom:16px;">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(220,76,93,0.8);margin-bottom:8px;">Mito</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#111827;line-height:1.2;text-decoration:line-through;opacity:0.85;">"É premium pelo tamanho"</div>
    </div>
    <div style="background:rgba(15,118,110,0.12);border-radius:16px;padding:16px;border:2px solid rgba(15,118,110,0.25);">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(15,118,110,0.8);margin-bottom:8px;">Verdade</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#111827;line-height:1.2;">Tamanho não garante padrão. Um mini bem executado vale mais.</div>
    </div>
  </div>
  {progress_bar(2, 7, True)}
  {swipe_arrow(True)}
</div>''')

# ── Slide 4: Mito 3 ────────────────────────────────────────────
slide4 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{DARK_BG};">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:#fff;">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#fecdd3;margin-bottom:12px;">mito 3</div>
    <div style="background:rgba(220,76,93,0.92);border-radius:16px;padding:16px;border:2px solid rgba(255,255,255,0.2);margin-bottom:16px;">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:8px;">Mito</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#fff;line-height:1.2;text-decoration:line-through;opacity:0.85;">"É premium se for bonito"</div>
    </div>
    <div style="background:rgba(15,118,110,0.92);border-radius:16px;padding:16px;border:2px solid rgba(255,255,255,0.2);">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:8px;">Verdade</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#fff;line-height:1.2;">Acabamento técnico conta mais. Beleza sem estrutura é superfície.</div>
    </div>
  </div>
  {progress_bar(3, 7, False)}
  {swipe_arrow(False)}
</div>''')

# ── Slide 5: Mito 4 ────────────────────────────────────────────
slide5 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{LIGHT_BG};">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:{DARK_BG};">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#C45C1F;margin-bottom:12px;">mito 4</div>
    <div style="background:rgba(220,76,93,0.12);border-radius:16px;padding:16px;border:2px solid rgba(220,76,93,0.25);margin-bottom:16px;">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(220,76,93,0.8);margin-bottom:8px;">Mito</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#111827;line-height:1.2;text-decoration:line-through;opacity:0.85;">"É premium pelo preço alto"</div>
    </div>
    <div style="background:rgba(15,118,110,0.12);border-radius:16px;padding:16px;border:2px solid rgba(15,118,110,0.25);">
      <div style="font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(15,118,110,0.8);margin-bottom:8px;">Verdade</div>
      <div style="font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#111827;line-height:1.2;">Preço não mede valor real. Use os 5 sinais de qualidade.</div>
    </div>
  </div>
  {progress_bar(4, 7, True)}
  {swipe_arrow(True)}
</div>''')

# ── Slide 6: Checklist (5 sinais) ──────────────────────────────
slide6 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:{DARK_BG};">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 48px 56px;color:#fff;">
    <div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:{BRAND_LIGHT};margin-bottom:16px;">5 sinais de qualidade</div>
    <h2 style="font-family:{HEADING_FONT};font-size:24px;line-height:1.1;font-weight:800;margin-bottom:18px;">Use esta checklist antes de comprar</h2>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:flex-start;gap:10px;"><span style="color:{PRIMARY_HEX};font-size:15px;width:18px;text-align:center;">✓</span><span style="font-family:{BODY_FONT};font-size:13px;color:rgba(255,255,255,0.88);">Densidade constante</span></div>
      <div style="display:flex;align-items:flex-start;gap:10px;"><span style="color:{PRIMARY_HEX};font-size:15px;width:18px;text-align:center;">✓</span><span style="font-family:{BODY_FONT};font-size:13px;color:rgba(255,255,255,0.88);">Fio mercerizado</span></div>
      <div style="display:flex;align-items:flex-start;gap:10px;"><span style="color:{PRIMARY_HEX};font-size:15px;width:18px;text-align:center;">✓</span><span style="font-family:{BODY_FONT};font-size:13px;color:rgba(255,255,255,0.88);">Junções perfeitas</span></div>
      <div style="display:flex;align-items:flex-start;gap:10px;"><span style="color:{PRIMARY_HEX};font-size:15px;width:18px;text-align:center;">✓</span><span style="font-family:{BODY_FONT};font-size:13px;color:rgba(255,255,255,0.88);">Trava interna</span></div>
      <div style="display:flex;align-items:flex-start;gap:10px;"><span style="color:{PRIMARY_HEX};font-size:15px;width:18px;text-align:center;">✓</span><span style="font-family:{BODY_FONT};font-size:13px;color:rgba(255,255,255,0.88);">Base estruturada</span></div>
    </div>
  </div>
  {progress_bar(5, 7, False)}
  {swipe_arrow(False)}
</div>''')

# ── Slide 7: CTA ────────────────────────────────────────────────
slide7 = esc(f'''
<div class="slide" style="position:relative;width:calc(100%/7);height:100%;flex-shrink:0;overflow:hidden;background:linear-gradient(165deg,{BRAND_DARK} 0%,{PRIMARY_HEX} 50%,{BRAND_LIGHT} 100%);">
  <div style="position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 48px 56px;color:{DARK_BG};text-align:center;">
    <div style="margin-bottom:20px;">
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);display:inline-flex;align-items:center;justify-content:center;font-family:{HEADING_FONT};font-size:18px;font-weight:800;color:#fff;">A</div>
    </div>
    <h2 style="font-family:{HEADING_FONT};font-size:28px;line-height:1.05;font-weight:800;margin-bottom:12px;max-width:15ch;text-wrap:balance;">SALVE PARA REVISAR ANTES DA COMPRA</h2>
    <p style="font-family:{BODY_FONT};font-size:14px;line-height:1.5;color:rgba(26,25,24,0.8);max-width:26ch;margin-bottom:20px;">Tem mais sobre esse tema no blog — link na bio.</p>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:{LIGHT_BG};color:{BRAND_DARK};font-family:{BODY_FONT};font-weight:600;font-size:14px;border-radius:28px;">SALVAR CHECKLIST</div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;padding:16px 28px 20px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;background:rgba(255,255,255,0.3);border-radius:2px;overflow:hidden;"><div style="height:100%;width:100%;background:#fff;border-radius:2px;"></div></div>
    <span style="font-size:11px;color:rgba(255,255,255,0.6);font-weight:500;">7/7</span>
  </div>
</div>''')

# ── Assemble HTML ─────────────────────────────────────────────────
html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AC-30-06 | Mitos e Verdades sobre Preço · AmiClube</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: radial-gradient(circle at top left, #ffffff 0%, #f0fdf4 46%, #e7fee7 100%);
      font-family: {BODY_FONT};
      color: {DARK_BG};
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 18px;
    }}
    .export-mode .swipe-arrow,
    .export-mode .progress-label,
    body.export-mode .ig-header,
    body.export-mode .ig-dots,
    body.export-mode .ig-actions,
    body.export-mode .ig-caption {{ display: none !important; }}
    body.export-mode .progress-bar {{ padding: 0 !important; }}
    body.export-mode .progress-track {{ display: none !important; }}
    .carousel {{
      width: min(420px, calc(100vw - 32px));
      aspect-ratio: 1080 / 1350;
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(18, 12, 9, 0.18);
      background: {DARK_BG};
    }}
    .wrapper {{
      display: flex;
      width: 700%;
      height: 100%;
      transition: transform 0.42s cubic-bezier(0.65, 0, 0.35, 1);
    }}
    .slide {{
      width: calc(100% / 7);
      height: 100%;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }}
    .bg {{
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-image: url('{hero_data_uri}');
    }}
    .overlay {{
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(196,92,31,0.25) 0%, rgba(196,92,31,0.10) 40%, rgba(26,25,24,0.70) 100%);
    }}
    .serif {{ font-family: {HEADING_FONT}; }}
    .sans {{ font-family: {BODY_FONT}; }}
  </style>
</head>
<body>
  <div class="carousel" id="carousel">
    <div class="wrapper" id="wrapper">
      {slide1}
      {slide2}
      {slide3}
      {slide4}
      {slide5}
      {slide6}
      {slide7}
    </div>
  </div>
  <script>
    let current = 0;
    const total = 7;
    const wrapper = document.getElementById('wrapper');
    function goTo(i) {{
      current = Math.max(0, Math.min(i, total - 1));
      wrapper.style.transform = `translateX(-${{current * (100/total)}}%)`;
    }}
    document.addEventListener('keydown', e => {{
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    }});
  </script>
</body>
</html>'''

# Fix Python formatting issues in the HTML (double braces from f-string)
html = html.replace('{{', '{').replace('}}', '}')

# Write preview HTML
preview_path = PREVIEW_DIR / "ac-30-06-v7.html"
preview_path.write_text(html, encoding="utf-8")
print(f"Preview written: {preview_path}")

# Also write a simple export info file
export_info = f'''# AC-30-06 Export Info (v7)

## Canvas
- 1080x1350px (7 slides)

## Slides
1. Hook: "O PREÇO NÃO CONTA SÓZINHO"
2. Mito 1 vs Verdade: Importado
3. Mito 2 vs Verdade: Tamanho
4. Mito 3 vs Verdade: Beleza
5. Mito 4 vs Verdade: Preço alto
6. Checklist: 5 sinais de qualidade
7. CTA: Salve para revisar

## Files to export
- ac-30-06-01.png (Slide 1)
- ac-30-06-02.png (Slide 2)
- ac-30-06-03.png (Slide 3)
- ac-30-06-04.png (Slide 4)
- ac-30-06-05.png (Slide 5)
- ac-30-06-06.png (Slide 6)
- ac-30-06-07.png (Slide 7)

## Export command
Use: node scripts/export-ac-30-06-v7.mjs

## Fixes from v5
- Uses background-image: url('data:...') for hero image (not <img> tag)
- Carousel is responsive: width: min(420px, calc(100vw - 32px)); aspect-ratio: 1080 / 1350;
- Follows instagram-carousel skill exactly
'''

info_path = PUBLISH_DIR / "export-info-v7.md"
info_path.write_text(export_info, encoding="utf-8")
print(f"Export info written: {info_path}")
