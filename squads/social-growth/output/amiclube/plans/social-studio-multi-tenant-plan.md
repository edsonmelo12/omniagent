# Social Studio — Multi-Tenant Dashboard Plan

**Platform:** BrightBean Studio (Django + HTMX + Tailwind)  
**Design Tool:** Pencil MCP (.pen files)  
**License:** AGPL-3.0 (fork obrigatório aberto)  
**Scope:** Generic white-label system + per-workspace branding  

---

## 1. Architecture: Generic Core + Per-Workspace Override

### Layer 1: Generic Core (White-Label)

```
social-studio/                    # Fork of brightbean-studio
├── core/
│   ├── design-system.pen      # Generic tokens ($primary, $secondary)
│   ├── screens.pen            # 10 screens (dashboard, calendar, composer...)
│   └── components.pen         # 30+ reusable components
├── backend/                    # Django core
│   ├── core/models.py        # Workspace, Theme, Member
│   ├── core/views.py        # Generic views
│   └── api/                  # REST endpoints
└── frontend/                   # Django templates + HTMX
    ├── base.html
    └── components/             # Reusable HTML partials
```

**Design System (Pencil):**
```javascript
// design-system.pen — GENERIC
variables = {
  "colors": {
    "primary": {"type": "color", "value": "$client-primary"},    // placeholder
    "secondary": {"type": "color", "value": "$client-secondary"},
    "accent": {"type": "color", "value": "$client-accent"}
  },
  "fonts": {
    "heading": {"type": "fontFamily", "value": "$client-heading"},
    "body": {"type": "fontFamily", "value": "$client-body"}
  }
}
```

---

### Layer 2: Per-Workspace Override

```
social-studio/
├── workspaces/
│   ├── amiclube/               # Workspace: AmiClube
│   │   ├── theme.json          # Override: burgundy/cream/Playfair
│   │   ├── logo.png
│   │   └── social-accounts.json
│   ├── cliente-b/               # Workspace: Cliente B
│   │   ├── theme.json          # Override: blue/white/Inter
│   │   └── ...
│   └── cliente-c/               # Workspace: Cliente C
│       └── ...
```

**Theme Override (AmiClube example):**
```json
{
  "workspace": "amiclube",
  "colors": {
    "client-primary": "#722F37",
    "client-secondary": "#F5F0E8",
    "client-accent": "#C75B39"
  },
  "fonts": {
    "client-heading": "Playfair Display",
    "client-body": "DM Sans"
  }
}
```

---

## 2. Database Schema (Multi-Tenant)

```python
# Django models
class Workspace(models.Model):
    name = models.CharField()          # "AmiClube", "Cliente B"
    slug = models.SlugField(unique=True)  # "amiclube"
    created_at = models.DateTimeField(auto_now_add=True)
    plan = models.CharField(choices=[('free','pro','premium')])

class Theme(models.Model):
    workspace = models.OneToOneField(Workspace)
    tokens = models.JSONField()           # Full Pencil variables override
    updated_at = models.DateTimeField(auto_now=True)

class Member(models.Model):
    workspace = models.ForeignKey(Workspace)
    user = models.ForeignKey(User)
    role = models.CharField(choices=[('admin','editor','client')])
    joined_at = models.DateTimeField(auto_now_add=True)

class SocialAccount(models.Model):
    workspace = models.ForeignKey(Workspace)
    platform = models.CharField()        # instagram, facebook, linkedin...
    credentials = models.EncryptedField()
    connected = models.BooleanField(default=False)
```

---

## 3. Pencil ↔ Django Integration

### Flow: Design → Code

```
Pencil (.pen)
  │
  ├── pen_set_variables(theme-amiclube.json)
  │     (injects generic $client-* tokens)
  │
  ├── pen_batch_design(operations with $client-primary)
  │     (components use variables, NOT hardcoded colors)
  │
  └── pen_export_nodes(format="png")
        │
        ▼
Django Management Command
  │
  ├── reads .pen file
  ├── extracts variables → Theme.tokens
  ├── saves Theme.tokens for workspace "amiclube"
  └── copies PNGs → static/themes/amiclube/
```

### Script: sync_pencil_to_django.py

```python
import json
from core.models import Workspace, Theme

def sync_pencil_to_django(pen_file, workspace_slug):
    with open(pen_file) as f:
        data = json.load(f)
    
    variables = data.get('variables', {})
    workspace = Workspace.objects.get(slug=workspace_slug)
    
    theme, _ = Theme.objects.update_or_create(
        workspace=workspace,
        defaults={'tokens': variables}
    )
    theme.tokens = variables
    theme.save()
    
    print(f"Synced {len(variables)} tokens to workspace '{workspace_slug}'")
```

---

## 4. Screen Specifications (Generic)

### All 10 Screens (Pencil → Django)

| # | Screen | Pencil Frame | Django Template | Generic Components |
|---|-------|---------------|----------------|----------------------|
| 1 | **Dashboard** | `dashboard` | `dashboard.html` | `card-metric`, `chart-line`, `post-thumbnail` |
| 2 | **Pipeline** | `pipeline` | `pipeline.html` | `step-flow`, `asset-card`, `status-dot` |
| 3 | **Client Intel** | `client-intel` | `client-intel.html` | `profile-card`, `metric-row`, `tag-objective` |
| 4 | **Business Rules** | `business-rules` | `business-rules.html` | `table-rules`, `card-policy` |
| 5 | **Market** | `market` | `market.html` | `tag-audience`, `timeline-trends` |
| 6 | **Competitive** | `competitive` | `competitive.html` | `card-competitor`, `gap-indicator` |
| 7 | **Channels** | `channels` | `channels.html` | `card-channel`, `status-dot` |
| 8 | **Asset Review** | `asset-review` | `asset-review.html` | `preview-frame`, `skill-ledger`, `verdict-badge` |
| 9 | **Calendar** | `calendar` | `calendar.html` | `month-view`, `post-card`, `status-legend` |
| 10 | **Skills** | `skills` | `skills.html` | `card-skill`, `tag-status` |

---

## 5. Implementation Order (Revised)

### Phase 1: Generic Design System (Pencil) — Week 1

```
social-studio-design.pen
├── variables (GENERIC: $client-*, $spacing-*, $fonts-*)
├── Frame: Dashboard (1440x900)
├── Frame: Pipeline (1440x900)
├── Frame: Client Intel (1440x900)
├── Frame: Business Rules (1440x900)
├── Frame: Market (1440x900)
├── Frame: Competitive (1440x900)
├── Frame: Channels (1440x900)
├── Frame: Asset Review (1440x900)
├── Frame: Calendar (1440x900)
├── Frame: Skills (1440x900)
└── shared/
    ├── design-tokens.pen
    ├── components.pen (30+ reusable)
    └── icons.pen
```

**Commands:**
```bash
# 1. Create generic design
pencil_open_document(filePathOrTemplate="new")

# 2. Set GENERIC tokens
pencil_set_variables(filePath="social-studio-design.pen", variables={
  "colors": {
    "client-primary": {"type": "color", "value": "#722F37"},  # placeholder
    "client-secondary": {"type": "color", "value": "#F5F0E8"}
  },
  "fonts": {
    "heading": {"type": "fontFamily", "value": "Playfair Display"},
    "body": {"type": "fontFamily", "value": "DM Sans"}
  }
})

# 3. Build 10 screens + export
pencil_batch_design(filePath="social-studio-design.pen", operations=[...])
pencil_export_nodes(filePath="social-studio-design.pen", nodeIds=["dashboard",...], format="png", outputDir="./static/")
```

---

### Phase 2: BrightBean Fork + Generic Setup — Week 2

```bash
# 1. Fork BrightBean (AGPL-3.0)
git clone https://github.com/brightbeanxyz/brightbean-studio social-studio
cd social-studio
git remote rename origin upstream
git remote add origin YOUR_REPO

# 2. Docker setup
cp .env.example .env
# Edit .env: DATABASE_PATH, SECRET_KEY, APP_URL

# 3. Run
docker-compose up -d

# 4. Create generic workspace
python manage.py created superuser
python manage.py shell
>>> Workspace.objects.create(name="Demo", slug="demo")
```

---

### Phase 3: Per-Workspace Branding — Week 3

```python
# Script: apply_branding.py
import json
from core.models import Workspace, Theme

def apply_branding(workspace_slug, theme_json):
    ws = Workspace.objects.get(slug=workspace_slug)
    theme, _ = Theme.objects.update_or_create(workspace=ws)
    theme.tokens = theme_json
    theme.save()
    
# Example: AmiClube
amiclube_theme = {
    "colors": {
        "client-primary": "#722F37",
        "client-secondary": "#F5F0E8",
        "client-accent": "#C75B39"
    },
    "fonts": {
        "heading": "Playfair Display",
        "body": "DM Sans"
    }
}
apply_branding("amiclube", amiclube_theme)
```

---

### Phase 4: Pencil → Django Sync — Week 4

```bash
# Management command
python manage.py sync_pencil_theme \
  --pen-file social-studio-design.pen \
  --workspace amiclube

# Result:
# - Reads Pencil variables
# - Overrides with theme-amiclube.json
# - Updates Theme.tokens in DB
# - Exports PNGs to static/themes/amiclube/
```

---

### Phase 5: White-Label Frontend — Week 5

```html
<!-- base.html — reads workspace theme dynamically -->
<style>
:root {
    --primary: {{ workspace.theme.tokens.colors."client-primary".value }};
    --secondary: {{ workspace.theme.tokens.colors."client-secondary".value }};
    --heading-font: {{ workspace.theme.tokens.fonts.heading.value }};
}
</style>

<!-- Components use CSS vars, never hardcoded -->
<button class="btn-primary" style="background: var(--primary)">
    {{ workspace.name }} Action
</button>
```

---

## 6. Multi-Tenant Data Flow

```
User visits amiclube.socialstudio.app
  │
  ▼ (Django middleware detects slug)
  │
WorkspaceMiddleware
  ├── request.workspace = Workspace.objects.get(slug="amiclube")
  ├── request.theme = workspace.theme.tokens
  └── request.members = workspace.member_set.all()
  │
  ▼
Template renders
  ├── base.html uses --primary from request.theme
  ├── logo from /static/workspaces/amiclube/logo.png
  └── social accounts from SocialAccount.objects.filter(workspace=workspace)
```

---

## 7. Deployment Strategy

### White-Label Options

| Client Type | URL Pattern | Branding |
|------------|------------|----------|
| **Self-Hosted** | `app.socialstudio.com` | Generic |
| **Per-Client Subdomain** | `amiclube.socialstudio.com` | Auto-white-label via middleware |
| **Custom Domain** | `social.amiclube.com` | Full white-label (CNAME) |

### Recommended: Render (Free Tier)

```yaml
# render.yaml
services:
  - type: web
    name: social-studio
    env: docker
    plan: starter  # Free: 750h/mo
    envVars:
      - key: DATABASE_URL
        value: postgres://...
```

---

## 8. Next Steps

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 1 | Fork brightbean-studio → social-studio | Edson | ⏳ Pending |
| 2 | Create `social-studio-design.pen` (generic) | Builder | ⏳ Pending |
| 3 | Set generic `$client-*` tokens | Builder | ⏳ Pending |
| 4 | Build 10 screens in Pencil | Builder | ⏳ Pending |
| 5 | Export PNGs → static/ | Builder | ⏳ Pending |
| 6 | Docker deploy to Render | Edson | ⏳ Pending |
| 7 | Create Workspace "amiclube" | Edson | ⏳ Pending |
| 8 | Apply AmiClube theme override | Edson | ⏳ Pending |
| 9 | Test: visit amiclube.socialstudio.app | Edson | ⏳ Pending |

---

**Plan Status:** ✅ Revised with GENERIC naming  
**Multi-Tenant:** ✅ White-label ready  
**Next Action:** Fork BrightBean → `social-studio`
