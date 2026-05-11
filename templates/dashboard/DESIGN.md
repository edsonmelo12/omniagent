# The Design System: OmniAgent Specification

## 1. Overview & Creative North Star: "The Precision Navigator"
The Creative North Star for this design system is **The Precision Navigator**. Moving away from the cluttered, "dashboard-heavy" look of 2020s SaaS, this system treats the social media agency interface as a high-performance flight deck. It prioritizes "heads-up" data visualization and intentional atmospheric depth.

To break the "template" look, we utilize **Intentional Asymmetry**. Key metrics are not confined to rigid equal-width columns; instead, primary data streams occupy 65% of the viewport, balanced by "orbital" utility panels. We leverage overlapping glass containers and high-contrast typography scales to create a sense of focused authority. This is a system where white space is not "empty"—it is "breathing room" for critical decision-making.

---

## 2. Colors & Surface Architecture
The color palette is rooted in the depth of `Deep Indigo` and the energy of `Electric Violet`.

### Surface Hierarchy & Nesting
We reject the flat UI. We build depth through **Tonal Layering**, treating the interface as stacked sheets of aeronautical glass.
*   **Base Layer:** `surface` (#f7f9fc) – The "Cloud Dancer" horizon.
*   **Low-Level Containers:** `surface_container_low` (#f2f4f7) – Secondary navigation or utility sidebars.
*   **Active Workspaces:** `surface_container_lowest` (#ffffff) – The primary focus area, providing the highest contrast for data.
*   **Elevated Modules:** `surface_container_high` (#e6e8eb) – Used for temporary overlays or contextual menus.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background shifts. For example, a `surface_container_low` sidebar should sit directly against the `surface` background. The change in hex code is the divider.

### The "Glass & Gradient" Rule
To evoke the "Cockpit" feel, floating elements (Modals, Hover Cards) must use **Glassmorphism**:
*   **Fill:** `surface_container_lowest` at 70% opacity.
*   **Blur:** `backdrop-filter: blur(12px)`.
*   **Signature Texture:** Use a subtle linear gradient on primary Action buttons, transitioning from `secondary` (#6b38d4) to `secondary_container` (#8455ef) at a 135° angle to simulate light hitting a physical control.

---

## 3. Typography
The system uses a tri-font strategy to balance futuristic character with extreme legibility.

*   **Display & Headlines (Space Grotesk):** This is our "Instrument" font. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) for high-impact data points (e.g., Total Reach, AI Sentiment). Its geometric terminals feel engineered and modern.
*   **Titles & Body (Manrope):** Our "Comms" font. `title-md` (1.125rem) and `body-md` (0.875rem) provide a clean, humanist touch that ensures long-form agency reports remain readable.
*   **Labels (Inter):** Our "Micro-copy" font. Used for `label-sm` (0.6875rem) in technical readouts and button labels. It is chosen for its unparalleled clarity at small scales.

---

## 4. Elevation & Depth
Depth is a functional tool, not a decoration.

*   **The Layering Principle:** Stack `surface_container_lowest` components on top of `surface_container_low` backgrounds to create a soft, natural lift.
*   **Ambient Shadows:** For floating glass elements, use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(26, 27, 65, 0.06)`. Note the use of `primary` (Deep Indigo) in the shadow color rather than pure black to maintain "tonal soul."
*   **The Ghost Border Fallback:** If a border is required for accessibility in high-density data tables, use `outline_variant` at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons (The Controls)
*   **Primary (AI/Innovation):** Background `secondary` (#6b38d4), `on_secondary` text. Applied to "Generate," "Optimize," or "Launch." Roundedness: `md` (0.375rem).
*   **Secondary (Authority):** Background `primary_container` (#1a1b41), `on_primary_fixed` text. Used for "Save," "Export," or "Settings."
*   **Tertiary:** Ghost style. No background, `on_surface` text, `label-md` weight.

### Data Chips
*   **Status:** Use `tertiary_fixed_dim` (#4edea3) with `on_tertiary_fixed` text for "Growth/Success" indicators.
*   **AI Tags:** Use a semi-transparent `secondary_fixed` (#e9ddff) with a subtle `Electric Violet` glow.

### Input Fields
*   **Styling:** Fields use `surface_container_low`. On focus, the background shifts to `surface_container_lowest` with a 2px `secondary` bottom-only highlight (no full-box stroke).
*   **Labels:** Always use `label-md` (Inter) positioned 0.4rem (`spacing-2`) above the input.

### Cards & Cockpit Modules
*   **Strict Rule:** Forbid divider lines. Separate content using `spacing-6` (1.3rem) or by nesting a `surface_container_lowest` block inside a `surface_container_low` frame.
*   **Module Header:** Use `title-sm` (Manrope) in `primary` color for high-authority section headers.

### Navigation (The Horizon)
*   Vertical sidebar using `surface_container_low`. Selected states should not use a box; they should use a 3px vertical "indicator light" in `secondary` (#8b5cf6) on the far left edge.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical grid layouts (e.g., 8-column main, 4-column sidebar) to create a custom "cockpit" feel.
*   **Do** use `Success Mint` (#10B981) sparingly but boldly for "Up" trends and "Published" states.
*   **Do** leverage `spacing-16` (3.5rem) for section breathing room to maintain a premium, editorial feel.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#191c1e) to maintain the soft "Cloud Dancer" aesthetic.
*   **Don't** use standard "Drop Shadows." Only use the Ambient Shadow specification for floating glass.
*   **Don't** use "Rounded-Full" (Pill) buttons for primary actions. Stick to `md` (0.375rem) to maintain a professional, engineered look.
*   **Don't** use borders to separate list items. Use vertical white space `spacing-3` (0.6rem) or subtle background-color toggling.