---
id: client-intent-profile
name: "Central Client Intent Profile"
whenToUse: |
  Creating agents or workflows that need a canonical semantic interpretation
  of a client, title, prompt, or creative brief before downstream search,
  image selection, copy drafting, or proposal generation.
  NOT for: raw web research without downstream creative usage.
version: "1.0.0"
---

# Central Client Intent Profile

## Purpose

This template standardizes how the system resolves ambiguous language into one
canonical meaning per client.

Use it as the shared semantic reference for:
- image search
- prompt generation
- copy briefing
- proposal creation
- creative direction

## Core Rule

- The title provides raw input.
- The client niche resolves the meaning.
- The normalized intent drives downstream output.

Never let a literal keyword outrank the domain context when they conflict.

## Profile Fields

### 1. Interpretation

- `client_niche`
- `content_topic`
- `commercial_intent`
- `primary_audience`
- `resolved_meaning`
- `confidence_score`

### 2. Search Rules

- `priority_terms`
- `supporting_terms`
- `negative_terms`
- `accepted_scenarios`
- `excluded_scenarios`

### 3. Fallback

- `fallback_direction`
- `fallback_visual_archetype`
- `fallback_keywords`

## Output Contract

The profile should be written as a compact, reusable block with:
- one canonical interpretation
- explicit ambiguity resolution
- explicit exclusions
- a safe fallback direction

## Example

```md
Client Niche: Artesanato / amigurumi
Content Topic: Oficina de amigurumi
Commercial Intent: Atrair interesse e engajamento
Primary Audience: Pessoas interessadas em crochê e artesanato
Resolved Meaning: Workshop criativo de amigurumi
Confidence Score: High

Priority Terms:
- amigurumi
- crochê
- artesanato
- ateliê
- feito à mão

Negative Terms:
- mecânica
- carro
- motor
- ferramentas automotivas
- garagem

Fallback Direction:
Mesa de artesanato com peças de amigurumi, fios e mãos trabalhando
```

## Decision Rule

If the output is visual:
- prefer scenes that match the niche vocabulary
- avoid literal but irrelevant interpretations

If the output is textual:
- keep the resolved meaning consistent across hooks, body, and CTA

If the output is strategic:
- reuse the same profile for proposal framing and audience inference

