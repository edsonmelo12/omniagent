# Omni-Governance-Shield

This component is mandatory for all HTML previews. It must be placed at the top of the body, before the actual social design or device simulator.

## CSS Standard

```css
.omni-governance-shield {
    background: #09090b; /* Zinc 950 */
    color: #e4e4e7; /* Zinc 200 */
    font-family: 'DM Sans', sans-serif;
    padding: 16px 24px;
    border-bottom: 1px solid #27272a;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

.omni-meta-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.omni-meta-label {
    font-family: 'Space Grotesk', monospace;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #71717a; /* Zinc 500 */
}

.omni-meta-value {
    font-size: 13px;
    font-weight: 500;
}

.omni-meta-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

/* Objective Badges */
.badge-authority { background: #4c1d95; color: #ddd6fe; } /* Violet */
.badge-curiosity { background: #1e3a8a; color: #dbeafe; } /* Blue */
.badge-discovery { background: #064e3b; color: #d1fae5; } /* Emerald */
.badge-recap { background: #713f12; color: #fef9c3; } /* Yellow/Brown */
```

## HTML Structure

```html
<header class="omni-governance-shield">
  <div class="omni-meta-group">
    <span class="omni-meta-label">Título do Post</span>
    <span class="omni-meta-value">{post_title}</span>
  </div>
  
  <div class="omni-meta-group">
    <span class="omni-meta-label">Tipo</span>
    <span class="omni-meta-value">{format}</span>
  </div>
  
  <div class="omni-meta-group">
    <span class="omni-meta-label">Canal</span>
    <span class="omni-meta-value">{channel}</span>
  </div>
  
  <div class="omni-meta-group">
    <span class="omni-meta-label">Artigo-Pai</span>
    <span class="omni-meta-value">{parent_article}</span>
  </div>
  
  <div class="omni-meta-group">
    <span class="omni-meta-label">Objetivo</span>
    <span class="omni-meta-value omni-meta-badge badge-{objective_slug}">{objective}</span>
  </div>
</header>
```

## Implementation Rules

1. **Self-Contained:** The shield must include its own styles via a `<style>` block if not using a global stylesheet.
2. **Fixed Height:** Avoid making it too tall; 80px-100px is the target.
3. **Data Integrity:** Values must be mapped directly from the asset manifest or brief.
4. **No Bleed:** The shield must not interfere with the 420px Instagram frame or any other device simulator. It sits OUTSIDE the simulator.
