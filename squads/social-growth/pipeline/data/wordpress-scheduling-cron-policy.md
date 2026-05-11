# WordPress Scheduling Cron Policy

## Objective

Adopt a hybrid publish model for blog content:

1. WordPress handles go-live via `status=future` + `date_gmt`.
2. Cron handles monitoring, retries, and incident visibility.

## Default Rules

1. `future` is the default post status for scheduled blog entries.
2. `draft` is fallback-only and requires explicit reason in `wordpress-status.md`.
3. Direct `publish` is forbidden unless the brief explicitly approves immediate publishing.
4. Every scheduled blog item must have:
   - `publish_date` (`YYYY-MM-DD`)
   - `publish_time_brt` (`HH:MM`)
   - `publish_at_iso` (`YYYY-MM-DDTHH:MM:SS-03:00`)
   - `wordpress_target_status` (`future` or `draft`)
5. **Every scheduled blog item MUST also include Yoast SEO fields** (see Required SEO Fields below).

## Required SEO Fields

All posts published via the squad MUST include these fields in a single POST to `/wp/v2/posts/{id}`:

### REST API payload structure

```json
{
  "title": "Post Title",
  "slug": "post-title-with-keyword",
  "content": "<p>HTML content</p>",
  "status": "future",
  "date": "2026-05-01T10:00:00",
  "date_gmt": "2026-05-01T13:00:00",
  "featured_media": <media_id>,
  "categories": [273],
  "yoast_head_json": {
    "focuskw": "frase-chave de foco",
    "title": "Título SEO começando com a frase-chave | Marca",
    "metadesc": "Meta descrição contendo a frase-chave."
  }
}
```

### Field mapping

| `yoast_head_json` key | Yoast post_meta key | Purpose |
|---|---|---|
| `focuskw` | `_yoast_wpseo_focuskw` | Focus keyphrase |
| `title` | `_yoast_wpseo_title` | SEO title (`<title>` tag) |
| `metadesc` | `_yoast_wpseo_metadesc` | Meta description |

### Infrastructure requirement

The Yoast REST bridge MUST be active in the theme's `functions.php`:

```php
add_action('rest_api_init', function () {
    $post_types = ['post', 'page'];
    foreach ($post_types as $post_type) {
        register_rest_field($post_type, 'yoast_head_json', [
            'get_callback' => function ($post) {
                return [
                    'focuskw' => get_post_meta($post['id'], '_yoast_wpseo_focuskw', true),
                    'title'   => get_post_meta($post['id'], '_yoast_wpseo_title', true),
                    'metadesc' => get_post_meta($post['id'], '_yoast_wpseo_metadesc', true),
                ];
            },
            'update_callback' => function ($value, $post_obj) {
                $mapping = [
                    'focuskw'  => '_yoast_wpseo_focuskw',
                    'title'    => '_yoast_wpseo_title',
                    'metadesc' => '_yoast_wpseo_metadesc',
                ];
                foreach ($mapping as $key => $meta_key) {
                    if (isset($value[$key])) {
                        update_post_meta($post_obj->ID, $meta_key, $value[$key]);
                    }
                }
            },
        ]);
    }
});
```

### Rejection criteria

A post MUST be rejected at checkpoint if:
- `yoast_head_json` is missing from the publish payload
- `focuskw` is empty (no focus keyphrase defined)
- `metadesc` is empty (no meta description)
- `slug` does not contain the focus keyphrase or a clear semantic variation
- SEO title does not start with the focus keyphrase
- `categories` is missing, empty, or contains only `Uncategorized` (ID 1)
- Category ID does not match one of the registered categories in the governance policy (`wordpress-category-governance.json`)

### Category mapping convention

Each post's `asset_id` (e.g. `AC-30-01`) is mapped in `wordpress-category-governance.json` under `asset_category_map`. The script `seo-publish.mjs` uses `CATEGORY_MAP` to convert category names to IDs at publish time. Both maps must be kept in sync.

```json
// CATEGORY_MAP (seo-publish.mjs)
{
  "Blog": 5,
  "Compra e Conversão": 276,
  "Confiança e Reputação": 275,
  "Escolha e Ergonomia": 273,
  "Preço, Valor e Tendências": 274
}
```

## Cron Responsibilities

Cron does not replace WordPress scheduling. Cron monitors and enforces reliability:

1. Validate upcoming items in `schedule-plan.md`.
2. Check publication evidence in `wordpress-status.md`.
3. Detect misses after the scheduled window.
4. Emit a canonical monitor report:
   - `squads/social-growth/output/{client}/publishing/wordpress-schedule-monitor.md`
5. Trigger retry/escalation playbook when needed.

## Cron Cadence

Recommended baseline:

1. Run every 15 minutes.
2. Look ahead window: 24 hours.
3. Late tolerance: 90 minutes after scheduled time before incident escalation.

## Required Evidence

The monitor report must include:

1. Current execution timestamp.
2. Parsed queue rows from the Blog Publish Queue.
3. Publication status evidence (mode, post id, edit URL, scheduled timestamps).
4. Alerts grouped by severity (`info`, `warning`, `critical`).

## Failure Handling

1. Missing schedule metadata: critical.
2. Missing `wordpress-status.md` near publish window: warning.
3. Scheduled slot passed with no publish evidence: critical.
4. Invalid status/mode mismatch (`future` expected but `draft` without reason): critical.

## Timezone Standard

1. Planner authors schedule in BRT (`-03:00`).
2. Publisher converts and sends `date_gmt` to WordPress.
3. Monitor compares times in UTC internally and prints both UTC and BRT in reports.
