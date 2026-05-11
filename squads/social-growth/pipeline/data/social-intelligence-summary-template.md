# Social Intelligence Summary Template

## Purpose

Store the structured result of the social intelligence intake before the proposal module runs.
This template is the required input layer for the universal research route and should be used for any client with a digital presence.

## Required Sections

### Context Scope
- scope type
- scope value
- scope basis
- objective
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

### Discovered Profiles
- platform
- handle
- profile URL
- source of discovery
- confidence

### Public Signals
- followers
- following
- posts
- last visible post date
- content frequency
- dominant formats
- visible CTA
- visible proof signals

### Numeric Presence
- channels found
- channels active
- last post age in days
- reputation count
- reputation rating
- public visibility score
- notes on anything that is still `not confirmed`

### Proposal Readiness
- whether the current evidence already supports a presentation or proposal
- what is still missing if the answer is no
- whether the commercial proposal module should run in this cycle
- whether the user explicitly wants a single consolidated client report that includes the proposal deck and textual proposal, if applicable

### Proposal Question
- ask the user exactly: "Este ciclo também deve gerar um documento único com a proposta comercial, deck e relatório consolidado?"
- if yes, keep the delivery consolidated in `output/<client-slug>/client-report.md`
- if no, continue with strategy and content only

### Confirmed Analytics
- reach
- impressions
- profile visits
- clicks
- saves
- shares
- video completion
- engagement rate

### Main Gaps
- presence
- consistency
- proof
- conversion
- differentiation

### Scores
- presence score
- consistency score
- proof score
- conversion score
- maturity score
- confidence score

### Market Frame
- direct competitors
- aspirational references
- substitute offers
- scope notes
- position in the market

### Creative Cues
- palette hints
- typography cues
- layout or composition hints
- channel priority
- visual constraints

### Opportunity Notes
- market opening
- content angle
- product or project priority
- recommended narrative

### Suggested Research Sources
- source name
- source type (search, trend, social, news, video, first-party analytics)
- access mode (free, freemium, paid, API key required)
- why this source matters for this client
- 1-2 practical query examples the user can run
- expected signal (trend, demand, language, competitor move, creative reference)
- freshness cadence (daily, weekly, monthly)

### Auto-Generated Notes
- what was inferred automatically
- what still needs user confirmation
- what proof must not be claimed yet

### Confidence
- public-only
- partial analytics
- full analytics
- needs confirmation

### Evidence
- urls
- observed dates
- screenshots
- export references
- source notes

## Usage Rule

The proposal module must read this summary before choosing the archetype and building the deck.
The summary should always surface numeric signals before qualitative interpretation.
The summary should also make the readiness for a commercial proposal explicit, even when the proposal module is optional.
The summary should also state whether the user wants a consolidated proposal report or only the research/strategy flow.
The summary should also keep brand-profile inferences separate from confirmed facts so proposal and content modules do not overclaim.
The summary should also carry forward creative cues and competitor context already discovered during intake so later phases do not rediscover the same signals.
The summary should always include a suggested-research-sources block so the user can continue investigating with concrete sources and ready-to-run queries.
