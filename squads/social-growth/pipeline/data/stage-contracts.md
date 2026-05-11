# Stage Contracts

## Purpose

Define what each agent consumes and produces so the squad works through contracts instead of loose conventions.

## Intake

Owner: `Intake`

Input:
- links
- documents
- notes
- discovery material

Output:
- draft client record
- source list
- open questions

Blocked when:
- source material is too thin to infer a stable record

## Client Record

Owner: `Intake` and `Strategist` depending on the correction type

Input:
- intake output
- user corrections
- evidence

Output:
- editable client record
- current offer
- audience
- tone
- positioning

Blocked when:
- offer, audience or positioning are contradictory

## GEO / AI Discoverability

Owner: `Geo Audit`

Input:
- client record
- website
- social intelligence
- market context

Output:
- geo score
- canonical positioning
- evidence inventory
- schema recommendations
- risk flags
- priority fix order

Blocked when:
- the website or source-of-truth page cannot be identified
- the site is too thin to evaluate against the audit criteria

## Research

Owner: `Researcher`

Input:
- client record
- public evidence
- social intelligence

Output:
- market context
- strategic observations
- market, competition and opportunity notes
- presence digital map
- audience hypotheses
- risks
- suggested research sources with practical query examples for user continuation

Blocked when:
- client record is not usable as base truth

Success criteria:
- the research clearly separates market, competition and opportunity
- the research keeps presence digital and audience in the analysis layer
- the output includes at least one actionable implication for strategy
- the output includes a practical source-suggestion block to guide user-side research continuation

## Strategy

Owner: `Strategist`

Input:
- client record
- research
- evidence

Output:
- strategic direction
- content angle
- cadence
- priorities

Blocked when:
- research does not support a coherent recommendation

## Optional Proposal

Owner: `Strategist` or `System` when the client needs a sales deck

Input:
- client record
- social intelligence
- research
- commercial request

Output:
- proposal archetype
- evidence summary
- recommended offer
- CTA
- slide-ready outline
- unified client report when the proposal checkpoint is confirmed

Blocked when:
- the client does not need a proposal in this cycle
- evidence is too weak to support a deck without guesswork

Rule:
- do not enter this stage unless the user explicitly requested the proposal or the checkpoint was confirmed

Checkpoint requirement:
- ask the user whether this cycle should generate the consolidated commercial report before entering this stage

## Content Plan

Owner: `Strategist`

Input:
- strategy
- client record
- constraints

Output:
- themes
- formats
- CTA direction
- publishing cadence

Blocked when:
- strategy is still ambiguous or unstable
- research has not yet been closed and handed off

## Blog Topic Backlog

Owner: `Strategist`

Input:
- strategy
- research
- social intelligence
- GEO discoverability summary, when available

Output:
- ranked topic backlog (10-20)
- trend signal metadata (source, date, validity window, confidence)
- top 3 ready-now topics
- rejected topics with reasons

Blocked when:
- strategy is unstable or too vague for topic prioritization

Rule:
- trend research starts in this stage; earlier stages must not pre-execute trend collection as mandatory output

## Blog Draft

Owner: `Blog Writer`

Input:
- strategy
- client record
- research
- blog architecture
- long-form brief

Output:
- blog outline
- blog draft
- copy brief lock
- hook strategy
- citation-ready structure
- family-specific section arc preserved in the draft
- final Portuguese copy with accents normalized
- no draft-style headings in the public body

Blocked when:
- the blog architecture is missing
- the long-form brief is missing or the strategy is still unstable
- a script, template, or reusable prose mold is being used to bypass the writing stage

## Blog Architecture

Owner: `Blog Architect`

Input:
- strategy
- client record
- research
- long-form brief

Output:
- thesis
- structure family
- copy brief lock
- section arc
- proof map
- anti-repetition guardrails
- repetition guardrails
- featured-image selection criteria and rationale

Blocked when:
- the long-form brief is missing or the strategy is still unstable
- the angle was pre-shaped by a template instead of selected from client/topic context

## Discovery Optimization

Owner: `Discovery Optimizer`

Input:
- blog draft
- brand profile
- research

Output:
- discovery-optimized blog
- copy brief preservation notes
- author block
- source notes
- schema block
- structure preserved without flattening the selected family
- public copy normalized in final Portuguese, with no raw draft headings
- featured-image selection rationale and thesis match

Blocked when:
- the blog draft is not approved or the inputs are too thin for SEO, GEO and LLM optimization
- the brand or site entity is still ambiguous and the GEO / AI discoverability audit has not been run yet
- the optimization pass is being asked to rescue a template-generated article instead of a real draft

## Review and Publication Gate

Owner: `Reviewer`

Input:
- optimized blog output
- repurpose package, when present
- visual direction and render manifest, when present

Output:
- weighted publication scorecard (0-100)
- severity map (`P1` / `P2` / `P3`)
- decision (`publish` / `revise` / `hold`)
- client editorial backlog update

Blocked when:
- the article body was generated by script/template rather than the squad flow
- the hook, thesis, and section arc cannot be traced back to the brief and architecture stages

Blocked when:
- scorecard is missing or cannot justify the verdict
- there are unresolved `P1` blockers

## Content Repurpose

Owner: `Content Repurposer`

Input:
- discovery-optimized blog
- content plan
- platform constraints

Output:
- native social variations
- repurpose package

Blocked when:
- the discovery-optimized blog is missing or the target platforms are unclear

## Content Production Package

Owner: `Creator`

Input:
- content plan
- blog architecture, when long-form content is in scope
- blog draft, when long-form content is in scope
- discovery-optimized blog, when repurpose is needed
- tone of voice
- approved positioning

Output:
- publishable content production package
- platform-specific variations

Blocked when:
- the plan is not clear enough to execute
- the required blog or discovery outputs are missing in long-form cycles

## Visual Direction

Owner: `Visual Director`

Input:
- content production package
- discovery-optimized blog, when image or article-led assets depend on it
- strategy
- tone of voice
- visual references

Output:
- visual system
- platform-specific creative brief
- layout guidance
- production notes

Blocked when:
- the content production package does not define a stable direction

## Creative Render

Owner: `Creative Renderer`

Input:
- content production package
- visual direction
- production package
- channel matrix
- execution plan

Output:
- rendered asset manifest
- final image paths or URLs
- variant metadata
- export notes

Blocked when:
- the direction is not executable as a stable template/render system
- required asset metadata is missing

## Review

Owner: `Reviewer`

Input:
- content production package
- discovery-optimized blog, when applicable
- visual direction
- rendered assets
- quality criteria

Output:
- review notes
- corrections
- approval readiness status
- anti-repetition verdict
- orthography and heading hygiene verdict
- featured-image selection verdict

Blocked when:
- the package does not match the brief, the visual system or the rendered asset quality bar
- the review does not validate structure variety against recent outputs
- the public copy still exposes unaccented final text or draft-style headings
- the featured image appears generic, category-level, or thesis-mismatched

## Schedule

Owner: `Scheduler`

Input:
- approved content production package
- repurpose package, when the cycle includes repurposed social assets
- review notes
- rendered assets
- cadence

Output:
- schedule plan
- delivery order
- execution notes

Blocked when:
- content is not approved, the render manifest is missing or the cadence is unrealistic

## Approval

Owner: `System` with user confirmation

Input:
- schedule plan
- rendered assets

Output:
- approved or rejected schedule
- approval notes
- explicit confirmation that the system may proceed to the publishing executor

Blocked when:
- the schedule is missing, inconsistent or not backed by rendered assets

## Publish

Owner: `Publishing Executor`

Input:
- approved schedule
- platform-specific validation
- explicit user confirmation
- dry-run result

Output:
- publishing execution record
- dry-run validation result or live-simulated result
- blockers and warnings
- notes and result metadata

Blocked when:
- there is no publish execution request or no confirmed live request
- the schedule or content production package is not approved
- the target platforms cannot be resolved

## Monitoring

Owner: `Monitor`

Input:
- published schedule
- performance signals
- cadence history

Output:
- health summary
- observations
- action triggers

Blocked when:
- there is no published cycle to evaluate

## Contract Rule

The next agent should only run if its input contract is satisfied.
If the contract is not satisfied, the system should reopen the earliest missing stage instead of forcing progression.
