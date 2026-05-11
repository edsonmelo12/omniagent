# Social Intelligence Intake

## Purpose

Automatically collect and summarize the social presence and market context of a client before any proposal is written.

This layer removes manual searching from the workflow by using the website, public web signals and, when available, authorized analytics exports.
It is contextual, not local-only: the market frame can be local, regional, national, niche or hybrid depending on the client.

## What It Must Do

1. Discover official social profiles from the website and public web references.
2. Collect public profile data and recent posts.
3. Capture visible signals such as dates, themes, format, captions and public engagement.
4. Read authorized analytics exports when the client provides access.
5. Resolve the relevant market scope from the client context, or infer it when the user did not provide it.
6. Compare the client against relevant competitors when possible.
7. Produce a structured health summary for the proposal module.

## Inputs

- official website
- public social profile URLs
- public posts and profile pages
- screenshots or exports from analytics, when available
- competitor references
- notes about priority products, projects or campaigns
- scope hints such as city, region, niche, country, brand or product group
- the decision the analysis needs to support

## Collection Rules

- Prefer official sources over guesses.
- Use public data when no analytics export exists.
- Never invent metrics that are not visible or confirmed.
- Mark each signal with a confidence level.
- Preserve source links or evidence references.
- If a market scope is not explicit, infer it from the client record, website and public footprint.
- If a metric is unavailable, mark it as `not confirmed` instead of filling it with prose.
- In the executive summary, prefer numbers, counts, percentages and scores.

## Suggested Output Fields

### Context Scope
- scope type
- scope value
- scope basis
- analysis objective
- primary audience
- product or service frame

### Brand Profile Draft
- confirmed product or service
- inferred audience
- inferred pains
- inferred desires
- inferred unique value proposition
- inferred visual palette
- inferred tone of voice
- proof signals found
- proof signals missing

### Profile Discovery
- platform
- handle
- profile URL
- source of discovery
- confidence

### Public Presence
- followers
- following
- posts
- last post date
- content frequency
- dominant formats
- visible CTA
- visible proof signals

### Numeric Signals
- channels found
- channels active
- last visible post age in days
- reputation count
- reputation rating
- public visibility score
- percent confirmed
- percent inferred

### Content Signals
- recurring themes
- strongest post patterns
- weak or missing formats
- CTA quality
- proof quality

### Health Summary
- presence score
- consistency score
- proof score
- conversion readiness
- maturity score
- overall diagnostic

### Data Completeness
- public-only
- partial analytics
- full analytics
- needs confirmation
- confirmed
- observed
- inferred

### Market Frame
- direct competitors
- aspirational references
- substitute offers
- scope notes

### Auto-Generation Rules
- a first-pass brand profile may be inferred from the website, public social signals and documents
- social proof must only be marked as confirmed when it is visible in public sources or provided by the client
- if a proof item is not confirmed, label it as missing, inferred or needs confirmation

## Decision Rules

- If only public signals are available, the summary must stay public-only.
- If analytics exports exist, include them and label them as confirmed.
- If profiles cannot be matched confidently, flag them for review instead of forcing a match.
- If one empreendment or product has a stronger signal, keep it separate from the institutional brand.
- If the scope is not explicit, resolve it before ranking competitors.
- If there are no numbers, do not promote the claim to the executive layer.
- If the brand profile is auto-generated, keep confirmed and inferred sections separate.

## Output Format

The module should produce a short, structured summary that feeds the proposal builder:

```md
# Social Intelligence Intake

## Context Scope
- ...

## Discovered Profiles
- ...

## Public Signals
- ...

## Numeric Signals
- ...

## Confirmed Analytics
- ...

## Main Gaps
- ...

## Scores
- ...

## Market Frame
- ...

## Opportunity Notes
- ...

## Confidence
- ...

## Evidence
- ...
```

## Why This Exists

This layer makes social analysis a built-in capability of the system, not a manual task left to the operator.

It allows the proposal module to start from evidence and build a commercial narrative from real signals.
It also makes the market frame explicit so the squad can work local, regional, national or niche depending on the client.
