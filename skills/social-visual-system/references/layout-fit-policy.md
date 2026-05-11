# Layout Fit Policy

Overflow is a production failure.

If content falls below the visible frame, overlaps protected UI space, or only
fits by aggressive compression, reject the layout and restructure it.

## Fit model

Do not evaluate a slide by item count alone.

Live slide capacity depends on:

- template type
- top weight
- body density
- protected bottom area

### Top weight

Top weight is the vertical cost of:

- eyebrow or label
- header or chrome
- headline
- subhead

Use these buckets:

- `top-light`: short headline, low top stack
- `top-medium`: two-line headline or short support copy
- `top-heavy`: long headline, subhead, or stacked top blocks

### Body density

Body density is shaped by:

- number of cards
- number of stacked blocks or metric blocks
- number of steps
- amount of support text
- spacing required for readability

### Protected bottom area

Always reserve safe space for:

- progress bar
- counters
- fixed CTA controls
- visual breathing room above bottom UI

## Default correction order

When a layout does not fit, fix it in this order:

1. remove non-essential support copy
2. simplify the component type
3. reduce card or step count
4. split into more slides
5. switch template
6. only then tighten spacing or type size

Do not start by shrinking the whole design.

## Template guidance

### `hero`

- safe for one dominant idea plus one support block

### `insight-grid`

- safe default: max 2 cards
- more than 2 cards is high risk in the current carousel system

### `steps-list`

- `top-light`: up to 3 short steps
- `top-medium`: up to 2 short steps
- `top-heavy`: avoid or split

### `metrics-stack`

- safe default: max 2 stacked metric blocks
- treat metrics as cards for fit purposes
- if the headline grows, 2 blocks may already be the limit
- never rely on 3 compact metrics as a default in the current Instagram carousel system

### `quote-proof`

- safe default: 1 primary block plus 1 support line

## Hard reject conditions

- content falls below the visible frame
- bottom UI overlaps content
- cards, metrics, or steps feel compressed even if barely visible
- title length pushes the body into unreadable density

## Decision rule

The limit of a slide is not defined by the template alone.

It is defined by the combination of template, top weight, and body density.
