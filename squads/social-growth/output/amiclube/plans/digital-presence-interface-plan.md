# Social Growth · Digital Presence Interface Plan

**Client:** AmiClube  
**Date:** 2026-05-01  
**Tool:** Pencil MCP (.pen files)  
**Scope:** 10 screens end-to-end

---

## 1. Screen Hierarchy & Order

| # | Screen | Priority | Reason |
|---|-------|----------|--------|
| **1** | **Digital Presence** | P0 | Landing — shows "where we are" first |
| **2** | **Pipeline Flow** | P1 | After seeing presence, client wants "what's being produced" |
| **3** | **Client Intelligence** | P1 | Business context for pipeline decisions |
| **4** | **Business & Rules** | P2 | Monetization + governance |
| **5** | **Market** | P2 | Audience + trends |
| **6** | **Competitive** | P3 | Gap analysis |
| **7** | **Channel Presence** | P3 | API status + credentials |
| **8** | **Asset Review** | P1 | Preview + Skill Ledger (frequent use) |
| **9** | **Schedule/Calendar** | P2 | Timeline of publications |
| **10** | **Skill Inventory** | P3 | Reference — when to use each skill |

---

## 2. Technical Architecture

### Files Structure
```
squads/social-growth/output/amiclube/designs/
├── social-dashboard.pen          # Screen 1: Digital Presence
├── pipeline-flow.pen               # Screen 2: Pipeline Flow
├── client-intelligence.pen         # Screen 3: Client Intelligence
├── business-rules.pen             # Screen 4: Business & Rules
├── market-intelligence.pen        # Screen 5: Market
├── competitive-map.pen            # Screen 6: Competitive
├── channel-presence.pen          # Screen 7: Channel Presence
├── asset-review.pen              # Screen 8: Asset Review
├── schedule-calendar.pen         # Screen 9: Schedule/Calendar
├── skill-inventory.pen           # Screen 10: Skill Inventory
└── shared/
    ├── design-tokens.pen          # Shared variables
    ├── components.pen             # Reusable components
    └── icons.pen                  # Icon library
```

### Data Sources Mapping

| Screen | Data Files |
|--------|-----------|
| 1. Digital Presence | `social-intelligence-summary.md`, `social-publish-monitor.md`, `schedule-status.md` |
| 2. Pipeline Flow | `campaign-manifest.json`, `editorial-backlog.md`, `rendered-assets.md` |
| 3. Client Intelligence | `company.md`, `client-record.md`, `preferences.md` |
| 4. Business & Rules | `client-record.md`, `anti-patterns.md`, `wordpress-scheduling-cron-policy.md` |
| 5. Market | `market-intel.md`, `research/*.md` |
| 6. Competitive | `research/*.md`, `social-intelligence-summary.md` |
| 7. Channel Presence | `social-intelligence-summary.md`, `channel-eligibility.json` |
| 8. Asset Review | `campaign-manifest.json`, HTML previews, review files |
| 9. Schedule/Calendar | `schedule-plan.md`, `social-publish-monitor.md` |
| 10. Skill Inventory | `skills/*/SKILL.md`, `skill-invocation-gate.md` |

---

## 3. Screen Specifications

### Screen 1: Digital Presence (Landing)

**Goal:** Show "where we are" — follower growth, published content, access sources.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  AmiClube · Digital Presence · 2026-05-01          │
├─────────────────────────────────────────────────────┤
│  [Followers Card]  [Posts Card]  [Blog Card]     │
│  IG: 12.4K ↑12%  FB: 8.2K ↑8%  LinkedIn: 3.1K ↑15% │
├─────────────────────────────────────────────────────┤
│  Follower Growth (12 months)                       │
│  [Line Chart — IG/FB/LI over time]               │
├─────────────────────────────────────────────────────┤
│  Published Content by Channel                       │
│  [Bar Chart: IG 45, FB 12, LinkedIn 8, Blog 8] │
├─────────────────────────────────────────────────────┤
│  Access Sources (Last 30d)                         │
│  [Pie: Organic 45%, Social 30%, Direct 15%, Other 10%] │
├─────────────────────────────────────────────────────┤
│  Recent Posts (Last 5)                            │
│  [Thumbnail grid with engagement metrics]            │
└─────────────────────────────────────────────────────┘
```

**Pencil Components:**
- `card-metric` (reusable): follower count + MoM change
- `chart-line` (reusable): follower growth
- `chart-bar` (reusable): published content
- `chart-pie` (reusable): access sources
- `post-thumbnail` (reusable): recent posts preview

---

### Screen 2: Pipeline Flow

**Goal:** Visualize asset production flow with Skill Ledger per step.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Pipeline Flow · AmiClube                          │
├─────────────────────────────────────────────────────┤
│  Flow: Creator → Visual Director → Creative Renderer → Reviewer │
│  [═══════> ═════════> ═════════> ═══════ ]  │
├─────────────────────────────────────────────────────┤
│  Assets by Step                                  │
│  Creator (3):  AC-30-14 ✓  AC-30-15 ✓  AC-30-16 ✓ │
│  VD (3):       AC-30-14 ✓  AC-30-15 ✓  AC-30-16 ✓ │
│  CR (2):       AC-30-14 ✓  AC-30-15 ✓  [AC-30-16 pending] │
│  Reviewer (0):  [waiting...]                        │
├─────────────────────────────────────────────────────┤
│  Asset Detail Popup (click any asset)               │
│  ID: AC-30-14 | Status: review                       │
│  Skills: instagram-carousel ✓  social-visual-system ✓ │
│  [View Preview] [View VDC] [View Review]            │
└─────────────────────────────────────────────────────┘
```

---

### Screen 3-7: Intelligence Screens (Summary Specs)

| Screen | Layout | Key Components |
|--------|-------|-----------------|
| Client Intelligence | Profile card + KPIs + objectives | `card-profile`, `metric-row`, `tag-objective` |
| Business & Rules | Revenue model + policies + anti-patterns | `table-rules`, `card-policy`, `tag-anti-pattern` |
| Market | Audience + trends + seasonality | `tag-audience`, `timeline-trends`, `card-season` |
| Competitive | Competitor grid + gap analysis | `card-competitor`, `gap-indicator`, `map-competitive` |
| Channel Presence | Channel cards + API status | `card-channel`, `status-dot`, `btn-reconnect` |

---

### Screen 8: Asset Review

**Goal:** Preview assets with Skill Ledger + verdict.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Asset Review · AC-30-14                           │
├─────────────────────────────────────────────────────┤
│  [Preview Frame: 540x675px]                       │
│  <rendered HTML preview via iframe/image>            │
├─────────────────────────────────────────────────────┤
│  Skill Invocation Ledger                          │
│  ✅ instagram-carousel (invoked)                    │
│  ✅ social-visual-system (invoked)                 │
│  ❌ reels-sequence (missing) — BLOCKED             │
├─────────────────────────────────────────────────────┤
│  Review Verdict                                  │
│  ❌ BLOCKED — Skill missing + accent errors        │
│  [View Full Review] [Request Fix]                   │
└─────────────────────────────────────────────────────┘
```

---

### Screen 9: Schedule/Calendar

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Schedule · May 2026                               │
├─────────────────────────────────────────────────────┤
│  W18 (May 01-03)                               │
│  [AC-30-31 ✓] [AC-30-32 ✓] [AC-30-33 ✓]      │
├─────────────────────────────────────────────────────┤
│  W19 (May 04-10)                               │
│  [AC-30-14 scheduled] [AC-30-15 scheduled]        │
├─────────────────────────────────────────────────────┤
│  W20 (May 11-17)                               │
│  [AC-30-16 pending] [AC-30-17 pending]            │
├─────────────────────────────────────────────────────┤
│  Status Legend: ✓ published  ⏳ scheduled  ❌ blocked │
└─────────────────────────────────────────────────────┘
```

---

### Screen 10: Skill Inventory

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Skill Inventory · Social Growth Squad                 │
├─────────────────────────────────────────────────────┤
│  [instagram-carousel]  [reels-sequence]  [stories-sequence] │
│  Format: Carousel      Format: Reels       Format: Stories     │
│  Status: ✅ active    Status: ✅ active   Status: ✅ active   │
│  Use when: multi-image   Use when: vertical    Use when: sequence   │
├─────────────────────────────────────────────────────┤
│  [facebook-post]  [social-single-post]  [linkedin-carousel] │
│  Format: FB static  Format: Single post    Format: LI doc-style  │
│  Status: ✅ active  Status: ✅ active    Status: ✅ active     │
├─────────────────────────────────────────────────────┤
│  [social-visual-system]  [creative-director]  [blog-preview...] │
│  Type: Visual system    Type: Direction       Type: Blog render      │
│  Status: ✅ active    Status: ✅ active    Status: ✅ active      │
└─────────────────────────────────────────────────────┘
```

---

## 4. Implementation Order

### Phase 1: Foundation (Day 1)
1. Create `design-tokens.pen` — colors, fonts, spacing
2. Create `components.pen` — cards, buttons, charts, tags
3. Create `icons.pen` — social icons, status dots, arrows

### Phase 2: Core Screens (Day 2-3)
4. **Screen 1: Digital Presence** (landing — P0)
5. **Screen 2: Pipeline Flow** (P1)
6. **Screen 8: Asset Review** (P1 — frequent use)

### Phase 3: Intelligence (Day 4-5)
7. Screen 3: Client Intelligence
8. Screen 4: Business & Rules
9. Screen 5: Market
10. Screen 6: Competitive
11. Screen 7: Channel Presence

### Phase 4: Operations (Day 6)
12. Screen 9: Schedule/Calendar
13. Screen 10: Skill Inventory

### Phase 5: Integration (Day 7)
14. Create `index.pen` — navigation hub linking all 10 screens
15. Export to PNG for stakeholder review
16. Generate HTML previews via Pencil

---

## 5. Design System (from existing assets)

### Colors (from AmiClube DNA)
```css
--burgundy: #722F37;
--cream: #F5F0E8;
--terracotta: #C75B39;
--warm: #E8D5C4;
--gold: #D4AF37;
--dark: #1A1A1A;
--brown: #2D2318;
```

### Typography
```css
--font-heading: "Playfair Display", "Cormorant Garamond", serif;
--font-body: "DM Sans", "Inter", sans-serif;
```

### Component Library
- `card-base`: rounded 12px, shadow, padding 24px
- `card-metric`: large number + label + trend arrow
- `chart-container`: 100% width, aspect ratio 16:9
- `status-dot`: 8px circle, green/yellow/red
- `tag`: rounded pill, uppercase, 10px font
- `btn-primary`: burgundy bg, cream text
- `btn-secondary`: cream bg, burgundy text

---

## 6. Next Steps

| Step | Action | Owner |
|------|--------|-------|
| 1 | Approve this plan | Edson |
| 2 | Setup Pencil design tokens | Builder |
| 3 | Create Screen 1 (Digital Presence) | Builder |
| 4 | Review Screen 1 with Edson | Atlas CEO |
| 5 | Iterate remaining 9 screens | Builder |

---

**Plan Status:** ⏳ Awaiting Approval  
**Estimated Completion:** 7 days  
**Output Format:** `.pen` files + PNG exports + HTML previews
