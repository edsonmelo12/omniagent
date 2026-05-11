# Squad Improvement Roadmap

## Purpose

Define the next improvements for the `social-growth` squad without expanding scope prematurely.

The goal is not to add more specialists first.
The goal is to make the existing squad execute in a clearer, safer, and more measurable sequence.

## Current Gap

The squad already has coverage for:

- intake
- research
- strategy
- content production package creation
- review
- scheduling
- monitoring

What is still weak is the coordination between those roles:

- the next valid step is not always explicit
- changes in the client record do not always imply clear invalidation rules
- approvals exist, but they are not fully modeled as workflow gates
- the chat terminal can suggest a step, but the orchestration is still mostly implicit
- live publish execution is available as a backend execution layer, but it still uses simulated delivery until platform adapters are connected

## Improvement Priorities

### 0. SEO/GEO Quality Backlog (Future Update)

Add a formal SEO/GEO quality layer to reduce publication risk and standardize editorial decisions.

Scope to implement in a future cycle:

- publication scorecard (0-100) with weighted dimensions:
  - intent alignment
  - GEO clarity and extractability
  - proof density and credibility
  - on-page SEO structure
  - technical consistency
  - conversion/CTA coherence
- discrepancy triage model with severity:
  - `P1`: blocks publication
  - `P2`: publishable with revision recommended
  - `P3`: optimization only
- corrective playbook by discrepancy type:
  - intent mismatch
  - weak thesis/answer latency
  - unsupported claims
  - weak heading/link/FAQ/schema structure
  - CTA-stage mismatch
- release gate:
  - minimum score threshold to publish
  - explicit blocker rules that force revision
- regression controls:
  - automatic orthography and readability checks
  - anti-genericity checks for intro/section endings
  - mandatory evidence notes for high-confidence claims

Definition of done for this module:

- every blog artifact gets score + severity + decision (`publish`, `revise`, `hold`);
- revision suggestions are generated as actionable patches, not generic notes;
- publication decision is reproducible from the recorded checklist.

### 1. Explicit Campaign State

Introduce a single campaign state model with states such as:

- `intake`
- `client_record`
- `research`
- `strategy`
- `content_plan`
- `content_production_package`
- `schedule`
- `approval`
- `publish`
- `monitoring`
- `adjustment`

Each state should have a clear entry condition and exit condition.

### 2. Stage Contracts

Each agent should work against a contract:

- input it expects
- output it must produce
- blockers that stop progression
- ownership of the step

This prevents hidden assumptions between agents.

### 3. Invalidation Rules

When the client record changes, the system should know what to reopen:

- offer changes -> strategy, content, schedule
- positioning changes -> strategy, content, schedule
- audience changes -> research, strategy, content
- minor operational corrections -> only the affected section

### 4. Orchestration Layer

Keep the current agents focused on production.
Use the system or a lightweight orchestrator to decide:

- the next valid action
- whether a step is blocked
- whether a step must be reopened
- when approval is required
- when a schedule may move into a real publish adapter

Add a dedicated orchestrator agent only if coordination remains fragile after the state model is in place.

### 5. Observability

Track basic cycle metrics:

- time per stage
- number of reopenings
- number of pending approvals
- number of blocked campaigns
- retrabalho caused by base changes

This turns the squad from opinion-driven to measurable.

## Recommended Sequence

1. Define the SEO/GEO quality backlog module and acceptance contract.
2. Define the campaign state machine.
3. Define contracts for each stage.
4. Define invalidation rules.
   - note-only client record edits should not reopen downstream work
   - identity and diagnosis edits should reopen research and everything after it
   - narrative and offer edits should reopen strategy and everything after it
5. Make the chat terminal always return:
   - current state
   - next valid step
   - blockers
6. Add metrics for stage latency and reopenings.
7. Revisit the need for a new orchestrator agent.

## Non-Goal

Do not add a new agent before the coordination problem is proven real.

More agents without stronger workflow rules only increase ambiguity.
