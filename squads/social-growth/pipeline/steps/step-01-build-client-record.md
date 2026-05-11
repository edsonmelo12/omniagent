---
execution: subagent
agent: intake
model_tier: powerful
inputFile: squads/social-growth/pipeline/data/intake-sources.md
outputFile: database/client-record
---

# Step 01: Build Client Record

## Context Loading

Load these inputs before executing:
- `squads/social-growth/pipeline/data/intake-sources.md` — raw links, documents and notes
- `squads/social-growth/output/context/social-intelligence-summary.md` — discovered profiles, public signals and confidence notes
- `squads/social-growth/pipeline/data/client-intake-guide.md` — fields to extract
- `squads/social-growth/pipeline/data/brand-profile-template.md` — confirmed/inferred brand and offer schema
- `squads/social-growth/pipeline/data/client-record-template.md` — target structure
- `_opensquad/_memory/company.md` — existing company context
- database client records — source of truth for persisted fields

## Instructions

### Process
1. Read the raw sources and identify confirmed facts.
2. Read the social intelligence summary and use it as evidence for profile, tone and activity signals.
3. Build the brand profile with confirmed facts, inferred signals and proof gaps.
4. Extract the client's strategy, services, audience and positioning.
5. Fill the client record template with the best available information.
6. Mark unknown or disputed fields as open questions.
7. Persist the record to the database as the active client record.

## Output Format

```
# Client Record

## Company Profile
[name, website, social profiles, industry]

## Business Overview
[what the company does, products/services, offer, differentiators]

## Brand Profile
[confirmed facts, inferred signals, proof gaps]

## Audience
[target audience, pains, outcomes]

## Voice and Positioning
[tone, positioning, language preferences]

## Notes
[open questions, assumptions, editable items]

## Persistence
[the record is saved in the database; no Markdown output is required for source of truth]
```

## Output Example

```
# Client Record

## Company Profile
- Name: Portal de Mídias
- Website: https://portaldemidias.com
- Social Profiles: Instagram, LinkedIn
- Industry: Agência digital

## Business Overview
- The company works with social media and digital marketing.
- Main offer: content, growth and execution support.
- Differentiator: strategy with practical delivery.

## Audience
- SMEs and service brands that need visibility and leads.

## Voice and Positioning
- Tone: professional, strategic and result-oriented.

## Notes
- The exact priority between lead gen and branding should be confirmed.
- The client record remains editable after extraction.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The record invents missing information.
2. The data is not persisted to the database.

## Quality Criteria

- [ ] Company profile is structured.
- [ ] Business overview includes services and offer.
- [ ] Brand profile separates confirmed and inferred information.
- [ ] Audience and positioning are explicit.
- [ ] Uncertain fields are labeled.
- [ ] The record is editable later.
