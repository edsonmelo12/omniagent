#!/usr/bin/env python3
"""Generate AC-30-06 v7 HTML with base64 background-image (no <img> tags)."""
import base64
import os
import sys

ASSET_ID = "ac-30-06"
CLIENT = "amiclube"
BASE_DIR = os.path.expanduser("~/Local Sites/omniagent")
PNG_DIR = f"{BASE_DIR}/squads/social-growth/output/{CLIENT}/social/publish/{ASSET_ID}"
OUTPUT_HTML = f"{BASE_DIR}/squads/social-growth/output/{CLIENT}/social/previews/{ASSET_ID}-v7.html"

# Number of slides
SLIDES = 7

def progress_bar(current, total):
    bar = "▓" * current + "░" * (total - current)
    return f'<div class="progress-bar"><div class="progress-track"><div class="progress-fill" style="width:{(current/total)*100}%"></div></div><span class="progress-label">{current}/{total}</span></div>'

def swipe_arrow():
    return '<div class="swipe-arrow">‹›</div>'

def main():
    # Read PNGs and convert to base64
    b64_images = []
    for i in range(1, SLIDES + 1):
        png_path = f"{PNG_DIR}/{ASSET_ID}-{i:02d}.png"
        if not os.path.exists(png_path):
            print(f"ERROR: PNG not found: {png_path}")
            sys.exit(1)
        with open(png_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            b64_images.append(f"data:image/png;base64,{b64}")

    # Build HTML
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
      font-family: 'DM Sans', sans-serif;
      color: #1A1918;
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
      background: #1A1918;
    }}
    .wrapper {{
      display: flex;
      width: {SLIDES * 100}%;
      height: 100%;
      transition: transform 0.42s cubic-bezier(0.65, 0, 0.35, 1);
    }}
    .slide {{
      width: calc(100% / {SLIDES});
      height: 100%;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }}
    .bg {{
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
    }}
    .swipe-arrow {{
      position: absolute;
      bottom: 16px;
      right: 16px;
      font-size: 24px;
      color: rgba(255,255,255,0.6);
      pointer-events: none;
    }}
    .progress-bar {{
      width: 100%;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .progress-track {{
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      overflow: hidden;
    }}
    .progress-fill {{
      height: 100%;
      background: #22c55e;
      border-radius: 2px;
      transition: width 0.42s;
    }}
    .progress-label {{
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="carousel" id="carousel">
    <div class="wrapper" id="wrapper">
'''

    for i, b64 in enumerate(b64_images, 1):
        html += f'''      <div class="slide">
        <div class="bg" style="background-image: url('{b64}')"></div>
        {progress_bar(i, SLIDES)}
        {swipe_arrow()}
      </div>
'''

    html += '''    </div>
  </div>
  <script>
    let current = 0;
    const total = ''' + str(SLIDES) + ''';
    const wrapper = document.getElementById('wrapper');
    function goTo(idx) {
      current = Math.max(0, Math.min(idx, total - 1));
      wrapper.style.transform = `translateX(-${current * (100 / total)}%)`;
    }
    setInterval(() => goTo((current + 1) % total), 3000);
  </script>
</body>
</html>'''

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Generated: {OUTPUT_HTML}")
    print(f"Slides: {SLIDES}")
    print(f"All images embedded as base64 background-image (no <img> tags)")

if __name__ == "__main__":
    main()
