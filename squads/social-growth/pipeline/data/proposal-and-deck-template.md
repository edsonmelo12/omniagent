# Proposal and Deck Template

## Purpose

Provide one reusable structure for:
- the commercial proposal Markdown;
- the presentation-style deck Markdown;
- future client-specific variants.

The template should work for any client with a digital presence.
When the proposal checkpoint is confirmed, the first visible output should be the presentation block with title, objective and slide order.
Before using this template, the system must confirm with the user whether this cycle should generate the consolidated proposal report in addition to research and strategy.

## Required Input Layers

1. `client record`
2. `social intelligence summary`
3. `market research`
4. `quantitative presence readout`
5. `proposal readiness note`

## Universal Narrative Order

1. **Executive Summary**
   - what the client is
   - what the market looks like
   - what the core gap is
   - whether the material is presentation-ready

2. **Presence**
   - channels found
   - followers/fans
   - posts
   - last post
   - site signals
   - confidence labels

3. **Audience**
   - priority segments
   - pains
   - decision context
   - content habits

4. **Competitive Landscape**
   - direct competitors
   - aspirational references
   - substitute offers
   - visibility comparison

5. **Score Readout**
   - presence
   - consistency
   - proof
   - conversion
   - maturity
   - confidence

6. **Opportunities**
   - 3 to 5 actionable openings
   - content angles
   - commercial or growth leverage

7. **Proposal Readiness**
   - can this become a presentation now?
   - can this become a proposal now?
   - what is missing if not?

8. **Risks and Assumptions**
   - uncertainty
   - unconfirmed signals
   - dependencies
   - validation needs

## Presentation-First Rule

When the proposal checkpoint is confirmed in a client-facing context:
- render the presentation header first;
- show the title, objective, thesis and archetype before the long-form narrative;
- keep the slide order visible from the start;
- only then append the textual proposal body if needed.

## Commercial Proposal Version

When writing the proposal Markdown after the checkpoint:
- keep the sections in the universal order;
- open with a presentation header that includes title, objective, thesis and archetype;
- append a clear recommendation block;
- include scope, cadence and KPIs;
- end with next steps.

## Deck Version

When writing the deck Markdown after the checkpoint:
- render the deck first in the UI or output stream;
- make the first visible block title + objective + thesis + archetype;
- compress each section into slide-ready bullets;
- keep the same section order;
- highlight numbers before interpretation;
- keep one clear slide for the recommendation.

## Rules

- do not invent numbers;
- do not hide confidence labels;
- do not remove the proposal-readiness note;
- do not change the order without a strong reason;
- do not mix confirmed metrics with inferred metrics without labels.

## Output Standard

The product should be able to generate:
- a proposal document;
- a slide deck;
- a dashboard input summary;
- a short executive note.
The default client-facing proposal experience should surface the deck-style presentation before the textual proposal when both are requested after the checkpoint.
When the user opts into a single consolidated delivery, the final file should be `output/<client-slug>/client-report.md`.
