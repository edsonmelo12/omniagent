#!/usr/bin/env python3
"""Generate AC-30-06 v7 following instagram-carousel skill exactly."""
import base64
from pathlib import Path

# Paths
ASSET_ID = "ac-30-06"
CLIENT = "amiclube"
BASE = Path.home() / "Local Sites/omniagent"
PNG_DIR = BASE / f"squads/social-growth/output/{CLIENT}/social/publish/{ASSET_ID}"
OUTPUT = BASE / f"squads/social-growth/output/{CLIENT}/social/previews/{ASSET_ID}-v7.html"

# Colors from skill + VDC
BRAND_PRIMARY = "#C45C1F"
BRAND_LIGHT = "#D9A85A"
BRAND_DARK = "#8C6A5E"
LIGHT_BG = "#F7F3EE"
DARK_BG = "#1A1918"
LIGHT_BORDER = "#E8E0D8"

# Read PNGs as base64
def b64_img(path):
    mime = "image/png"  # PNGs are confirmed PNG format
    data = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{data}"

# Slide texts from VDC
slides = [
    {
        "type": "hero", "bg": LIGHT_BG,
        "headline": "O PREÇO NÃO CONTA SÓZINHO",
        "subhead": "4 mitos que confundem quem compra amigurumi",
        "is_light": True
    },
    {
        "type": "myth", "bg": DARK_BG,
        "headline": "MITO 1",
        "body": "Amigurumi importado é sempre melhor",
        "truth": "Origem não garante qualidade — o importante é a tensão, o enchimento e o acabamento.",
        "is_light": False
    },
    {
        "type": "myth", "bg": LIGHT_BG,
        "headline": "MITO 2", 
        "body": "Quanto maior, mais caro deve ser",
        "truth": "O preço reflete tempo de execução, não tamanho. Um amigurumi pequeno pode levar dias.",
        "is_light": True
    },
    {
        "type": "myth", "bg": DARK_BG,
        "headline": "MITO 3",
        "body": "Se é bonito, está bem feito",
        "truth": "Beleza esconde costura malfeita, enchimento irregular e materiais de baixa durabilidade.",
        "is_light": False
    },
    {
        "type": "myth", "bg": LIGHT_BG,
        "headline": "MITO 4",
        "body": "Preço alto = qualidade garantida",
        "truth": "Preço alto pode ser marca, não qualidade. Avalie acabamento, simetria e segurança.",
        "is_light": True
    },
    {
        "type": "checklist", "bg": DARK_BG,
        "headline": "5 SINAIS DE QUALIDADE",
        "items": ["Costura invisível e firme", "Enchimento uniforme", "Simetria nas partes", "Segurança nos olhos", "Tamanho real condizente"],
        "is_light": False
    },
    {
        "type": "cta", "bg": f"linear-gradient(165deg, {BRAND_DARK} 0%, {BRAND_PRIMARY} 50%, {BRAND_LIGHT} 100%)",
        "headline": "SALVE PARA REVISAR ANTES DA COMPRA",
        "subhead": "amiclube.com.br",
        "is_light": False
    }
]

# Read background image (article hero)
hero_img_path = BASE / "squads/social-growth/output/amiclube/blog/assets/AC-30-05-preco-valor-hero.jpg"
hero_b64 = b64_img(hero_img_path) if hero_img_path.exists() else ""

# Generate HTML
html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AC-30-06 | Mitos e Verdades sobre Preço · AmiClube</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: {LIGHT_BG};
      font-family: 'DM Sans', sans-serif;
      color: #1A1918;
      display: flex;
      justify-content: center;
      padding: 18px;
    }}
    .ig-frame {{
      width: 420px;
      height: 525px;
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(18,12,9,0.18);
      background: #1A1918;
    }}
    .carousel-viewport {{
      width: 420px;
      height: 525px;
      overflow: hidden;
      position: relative;
    }}
    .carousel-track {{
      display: flex;
      width: {len(slides) * 420}px;
      height: 100%;
      transition: transform 0.42s cubic-bezier(0.65,0,0.35,1);
    }}
    .slide {{
      width: 420px;
      height: 525px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      padding: 32px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }}
    .slide.bg-img img {{
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }}
    .slide.bg-img .overlay {{
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.35);
      z-index: 1;
    }}
    .slide.dark .overlay {{ background: rgba(0,0,0,0.45); }}
    .slide > * {{ z-index: 2; position: relative; }}
    .serif {{ font-family: 'Playfair Display', serif; }}
    .sans {{ font-family: 'DM Sans', sans-serif; }}
    .tag {{
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 16px;
      display: inline-block;
    }}
    .tag.light {{ color: {BRAND_PRIMARY}; }}
    .tag.dark {{ color: {BRAND_LIGHT}; }}
    .headline {{
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.12;
      margin-bottom: 12px;
    }}
    .headline.light {{ color: #1A1918; }}
    .headline.dark {{ color: #fff; }}
    .body {{
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 16px;
    }}
    .body.light {{ color: #1A1918; }}
    .body.dark {{ color: rgba(255,255,255,0.85); }}
    .truth {{
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 15px;
      line-height: 1.4;
      padding: 16px;
      background: rgba(0,0,0,0.15);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      margin-top: 12px;
    }}
    .truth.light {{ color: #1A1918; background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.08); }}
    .truth.dark {{ color: #fff; }}
    .checklist {{
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 16px;
    }}
    .check-item {{
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
    }}
    .check-item.light {{ color: #1A1918; }}
    .check-item.dark {{ color: #fff; }}
    .check-icon {{
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: {BRAND_PRIMARY};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
      flex-shrink: 0;
    }}
    .cta-text {{
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      text-align: center;
      line-height: 1.2;
    }}
    .cta-sub {{
      font-size: 14px;
      color: rgba(255,255,255,0.7);
      text-align: center;
      margin-top: 8px;
    }}
    /* Progress bar */
    .progress-bar {{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 28px 20px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .progress-track {{
      flex: 1;
      height: 3px;
      border-radius: 2px;
      overflow: hidden;
    }}
    .progress-track.light {{ background: rgba(0,0,0,0.08); }}
    .progress-track.dark {{ background: rgba(255,255,255,0.12); }}
    .progress-fill {{
      height: 100%;
      border-radius: 2px;
      transition: width 0.42s;
    }}
    .progress-fill.light {{ background: {BRAND_PRIMARY}; }}
    .progress-fill.dark {{ background: #fff; }}
    .progress-label {{
      font-size: 11px;
      font-weight: 500;
    }}
    .progress-label.light {{ color: rgba(0,0,0,0.3); }}
    .progress-label.dark {{ color: rgba(255,255,255,0.4); }}
    /* Swipe arrow */
    .swipe-arrow {{
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 48px;
      z-index: 9;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .swipe-arrow.light {{ background: linear-gradient(to right, transparent, rgba(0,0,0,0.06)); }}
    .swipe-arrow.dark {{ background: linear-gradient(to right, transparent, rgba(255,255,255,0.08)); }}
    /* Export mode */
    body.export-mode .swipe-arrow,
    body.export-mode .progress-label {{ display: none !important; }}
    body.export-mode .progress-bar {{ padding: 0 !important; }}
    body.export-mode .progress-track {{ display: none !important; }}
  </style>
</head>
<body>
  <div class="ig-frame">
    <div class="carousel-viewport">
      <div class="carousel-track" id="track">
"""

for i, slide in enumerate(slides):
    bg_style = f"background: {slide['bg']};" if not slide['bg'].startswith('linear') else f"background: {slide['bg']};"
    is_light = slide['is_light']
    text_color = "light" if is_light else "dark"
    
    html += f'        <div class="slide {"bg-img" if i == 0 else ""}" style="{bg_style}">\n'
    
    # Background image for hero slide
    if i == 0 and hero_b64:
        html += f'          <img src="{hero_b64}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;">\n'
        html += f'          <div class="overlay {"dark" if not is_light else ""}" style="position:absolute;inset:0;z-index:1;"></div>\n'
    
    html += f'          <div style="position:relative;z-index:2;">\n'
    html += f'            <span class="tag {text_color}">MITOS E VERDADES</span>\n'
    html += f'            <div class="headline {text_color}">{slide["headline"]}</div>\n'
    
    if slide["type"] in ["myth"]:
        html += f'            <div class="body {text_color}">{slide["body"]}</div>\n'
        html += f'            <div class="truth {text_color}">"{slide["truth"]}"</div>\n'
    elif slide["type"] == "checklist":
        html += f'            <div class="checklist">\n'
        for item in slide["items"]:
            html += f'              <div class="check-item {text_color}"><div class="check-icon">✓</div>{item}</div>\n'
        html += f'            </div>\n'
    elif slide["type"] == "cta":
        html += f'            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">\n'
        html += f'              <div class="cta-text">{slide["headline"]}</div>\n'
        html += f'              <div class="cta-sub">{slide["subhead"]}</div>\n'
        html += f'            </div>\n'
    elif slide["type"] == "hero":
        html += f'            <div class="body {text_color}">{slide["subhead"]}</div>\n'
    
    html += f'          </div>\n'
    
    # Progress bar
    pct = ((i + 1) / len(slides)) * 100
    html += f'          <div class="progress-bar">\n'
    html += f'            <div class="progress-track {text_color}"><div class="progress-fill {text_color}" style="width:{pct}%"></div></div>\n'
    html += f'            <span class="progress-label {text_color}">{i+1}/{len(slides)}</span>\n'
    html += f'          </div>\n'
    
    # Swipe arrow (not on last slide)
    if i < len(slides) - 1:
        html += f'          <div class="swipe-arrow {text_color}">\n'
        html += f'            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">\n'
        stroke_color = "rgba(0,0,0,0.25)" if is_light else "rgba(255,255,255,0.35)"
        html += f'              <path d="M9 6l6 6-6 6" stroke="{stroke_color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>\n'
        html += f'            </svg>\n'
        html += f'          </div>\n'
    
    html += f'        </div>\n'

html += """      </div>
    </div>
  </div>
  <script>
    let current = 0;
    const total = """ + str(len(slides)) + """;
    const track = document.getElementById('track');
    function goTo(idx) {
      current = Math.max(0, Math.min(idx, total - 1));
      track.style.transform = `translateX(-${current * 420}px)`;
    }
    setInterval(() => goTo((current + 1) % total), 3000);
  </script>
</body>
</html>"""

OUTPUT.write_text(html, encoding="utf-8")
print(f"Generated: {OUTPUT}")
print(f"Slides: {len(slides)}")
print(f"Design system: DM Sans (body 14px), Playfair Display (headings 32px)")
print(f"IG frame: 420px wide (skill requirement)")
