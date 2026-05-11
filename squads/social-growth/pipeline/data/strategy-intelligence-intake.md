# Strategy Intelligence Intake

## Purpose

Transform long-form strategic references such as podcasts, cases and interviews into reusable strategy assets for the `social-growth` squad.

This layer turns external content into structured strategic knowledge that can be persisted, versioned and reused later according to the product or service being worked on.

The module also acts as a recommendation layer: it should not only extract a strategy from the source, but also suggest a ranked set of strategic options that fit the client context and campaign objective.

The recommendation layer should also translate the chosen strategy into a concrete campaign action plan with cadence, formats, weekly deliverables and CTA focus so the output is operational, not abstract.
When possible, the action plan should also include a day-by-day weekly agenda so the operator knows what to publish on each weekday.
Each agenda item should ideally include a publish-ready title to make execution copy-pasteable.
Each agenda item should also include a text base and caption so it can be turned into a draft with minimal rewriting.

## What It Solves

- removes manual pattern extraction from the strategy workflow;
- captures consolidated strategies from high-signal sources;
- stores the extracted strategy as a reusable asset;
- helps the squad rank strategies by fit for a specific offer;
- preserves history so future cycles can reuse what already worked.

## Inputs

- podcast links
- interview links
- case study links
- notes added by the operator
- optional product or service context
- optional campaign or objective context
- optional client segment or client archetype context
- optional funnel stage context

The optional campaign objective should be used to bias recommendations toward the most relevant organic outcome, for example:

- awareness
- authority
- education
- lead generation
- conversion
- retention

The optional client segment should be used to bias the recommendation toward the right strategy family for the business model, for example:

- consultive and high-ticket offers should lean toward authority, proof and objection handling;
- educational or productized offers should lean toward education and scale;
- e-commerce and local businesses should lean toward proof, conversion and trend when awareness is the goal;
- creator-led brands should lean toward community and recurring engagement.

The optional funnel stage should be used to bias the recommendation toward the correct tactical layer of the funnel:

- awareness should favor education and distribution;
- consideration should favor authority, proof and objection handling;
- decision should favor conversion and proof reduction;
- retention should favor community and recurring engagement;
- scale should favor systematization and operational repeatability.

## What the System Must Extract

### Source Summary
- source type
- title
- URL
- speaker or author
- date
- confidence

### Strategic Pattern
- core thesis
- offer positioning
- audience definition
- objection handling
- channel or format choice
- hook or angle
- proof mechanism
- CTA style

### Reusable Strategy Asset
- strategy name from a controlled vocabulary
- source references
- source category
- applicable product or service type
- applicable funnel stage
- expected objective
- confidence level
- version

### Strategy Recommendation Options
- primary recommendation
- secondary recommendations
- plan B recommendation
- fit band or suitability level
- explanation of why each option fits the current context
- tactical application notes for organic content
- campaign action plan with weekly cadence, format mix, priorities, actions and next tests
- day-by-day weekly agenda for publishing execution
- ready-to-use titles for each agenda item
- text base and caption for each agenda item

## Normalization Rules

- Prefer structured extraction over free text when possible.
- Separate observation from interpretation.
- Mark inferred items clearly.
- Keep the original source link attached to every extracted strategy.
- Avoid collapsing different offers into one generic strategy if their fit is not the same.

## Persistence Rules

- Store each extracted strategy as a versioned record.
- Preserve the original source and the extraction context.
- Record the associated product, service or campaign category in the database as the source of truth.
- Keep history so future recommendations can compare older and newer strategy patterns.

## Reuse Rules

- Search the stored strategy library before creating a new strategy from scratch.
- Rank strategies by fit for the current product or service.
- Reuse a prior strategy only when the offer, objective and audience remain compatible.
- If the fit is partial, adapt the strategy and record the adaptation as a new version.

## Ranking Criteria

The recommendation engine should prioritize strategies using the following order:

1. product and offer fit
   - category, offer type, promise and problem solved;
   - audience overlap and contextual similarity;
   - active, prioritized and in-campaign products receive a higher score.
2. strategic alignment
   - authority for consultative offers and higher-ticket services;
   - education for training and knowledge products;
   - conversion and scale for productized or SaaS offers;
   - fallback/risk-reduction when the context is ambiguous.
3. client archetype
   - consultive, educational, productized, e-commerce, local business, creator-led and B2B profiles;
   - the archetype should adjust the ranking only when it materially changes the best strategy family;
   - avoid hard forcing a strategy if the campaign objective clearly points elsewhere.
4. funnel stage
   - awareness, consideration, decision, retention and scale;
   - use the funnel stage to bias the ranking toward the right tactical layer;
   - avoid letting a downstream stage override a clearly upstream campaign objective.
5. source evidence
   - overlap between the extracted strategy and the product context;
   - confidence carried from the source analysis;
   - explicit signals recorded from the extraction step.
6. result ordering
   - primary = highest combined score;
   - alternatives = nearest valid fits after the primary;
   - plan B = safest coherent option when fit is weaker or the offer is less defined.

## Strategy Catalog Guidance

The engine should maintain a small controlled vocabulary of reusable strategic options and select among them based on context:

- `Autoridade para gerar prova`
- `Educação para clarificar o mecanismo`
- `Conversão para demonstrar valor`
- `Prova social para reduzir fricção`
- `Quebra de objeção para acelerar decisão`
- `Comunidade para gerar recorrência`
- `Escala para sistematizar execução`
- `Tendência para ampliar alcance`

Rules:

- use the objective and the offer context to rank the catalog;
- avoid recommending trend-led strategies when the client needs clarity, proof or conversion;
- avoid recommending conversion-heavy strategies when the context is still early-stage awareness;
- keep the labels reusable so the same recommendation can be reused in future cycles.

## Current Catalog State

The current canonical library is operationally authoritative in PostgreSQL.
This document keeps the controlled vocabulary and stability rules so the same strategy keys can be regenerated, reviewed and migrated without changing the meaning of the catalog.

Current reusable strategy seed count:
- `8` canonical strategies

Current controlled vocabulary:
- `Autoridade para gerar prova`
- `Educação para clarificar o mecanismo`
- `Conversão para demonstrar valor`
- `Prova social para reduzir fricção`
- `Quebra de objeção para acelerar decisão`
- `Comunidade para gerar recorrência`
- `Escala para sistematizar execução`
- `Tendência para ampliar alcance`

Stability rules:
- keep one canonical strategy key per label/objective/funnel combination;
- collapse duplicate YouTube inputs by `videoId` before strategy extraction;
- keep the strategy library versioned in PostgreSQL through `strategy_library_strategies` and `strategy_library_sources`;
- treat a strategy as mature when it has a controlled label, evidence, fit signals and at least one persisted source in the database.

## Strategy Signals

Each stored strategy should keep the signals that explain why it was recommended:

- textual matches with the product;
- consultative, educational or productized fit;
- performance or conversion intent;
- status and priority of the selected product;
- fallback conditions when the fit is partial.

## Naming Convention

Strategy names should use a controlled, intuitive vocabulary instead of raw transcript text.

Preferred labels:

- `Autoridade para gerar prova`
- `Educação para clarificar o mecanismo`
- `Conversão para demonstrar valor`
- `Escala para sistematizar execução`
- `Plano B para reduzir risco`

Rules:

- use the label that best matches the dominant objective of the strategy;
- keep `Plano B para reduzir risco` for fallback strategies;
- do not copy a raw podcast phrase into the persisted strategy name unless it is already a clean, reusable label;
- keep the summary and evidence fields for the detailed context, not the name itself.

## Output Format

```md
# Strategy Intelligence Intake

## Sources Processed
- ...

## Extracted Strategic Patterns
- ...

## Reusable Strategy Assets
- ...

## Fit by Product or Service
- ...

## Recommended Next Use
- ...

## Strategy Recommendations
- primary recommendation
- alternatives
- plan B
- contextual fit signals
- non-recommended strategies

## Confidence
- ...
```

## Relationship to Other Layers

- `social-intelligence-intake.md` captures public presence and profile evidence.
- `strategy-intelligence-intake.md` captures strategic mechanisms and the seed vocabulary from long-form sources.
- `social-intelligence-summary-template.md` stores the structured evidence before proposal creation.
- `product-master-guide.md` defines how structured evidence becomes product decisions.

## Why This Exists

The squad needs a durable memory of strategy, not just a one-off analysis of content.
This layer makes strategic references reusable across clients, products and future cycles.
