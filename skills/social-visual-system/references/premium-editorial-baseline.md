# Premium Editorial Baseline (Model: AC-30-02)

This baseline defines the mandatory visual structure for "Authority" and "Discovery" social assets. It is based on the successful execution of **AC-30-02 · Semana 1**.

## 1. Composition: The 3-Layer Rule
Every slide must strictly follow the 3-layer stack:

1.  **Background Layer:** Full-bleed image (`object-fit: cover`).
    *   **Visibility:** Opacity between 52% and 62% (Target: 56%).
    *   **Overlay:** Dark tint (Brand Dark or Black) at 12% to 28% opacity.
    *   **Blur:** Prohibited as default.
2.  **UI Layer (The Brand):** Clean typography and brand tokens.
    *   **Contrast:** White text on dark layers, Brand Primary for labels.
    *   **Layout:** Content padding of 36px-40px.
3.  **Evidence Layer (Optional):** A sharp, 100% opaque window or inset image when showcasing a specific detail from the parent article.

## 2. Typography Strategy (Editorial)
*   **Headings:** `Playfair Display`, weight 800, tracking -0.03em.
*   **Body:** `Inter` or `DM Sans`, weight 400, line-height 1.4.
*   **Labels/Tags:** Bold, uppercase, letter-spacing 0.2em, color: `BRAND_PRIMARY`.

## 3. Rhythm and Contrast
Carousels must alternate between high-contrast backgrounds to maintain engagement:
*   **Slide 1 (Hero):** Dark Editorial (Image + Text).
*   **Inner Slides:** Alternate between `BRAND_DARK` (or tinted dark image) and `LIGHT_BG` (or tinted light image).
*   **Final Slide (CTA):** High-impact brand color or unique dark composition.

## 4. UI Elements (The "Premium" Signals)
*   **ProgressBar:** Thin (3px), subtle track, high-contrast fill.
*   **Footer Signature:** "Editorial · Semana XX" or Handle (@amiclube) in tiny bold caps.
*   **Swipe Cues:** Subtle chevrons (never large/distracting).

## 5. Decision Gate
If a design looks "flat" or uses plain colored backgrounds without texture/depth, it violates this baseline. Refer to AC-30-02 HTML source for implementation details.
