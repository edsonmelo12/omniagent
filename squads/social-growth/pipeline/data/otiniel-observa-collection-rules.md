# Otiniel Observa - Collection Rules

## Purpose

Define how `Otiniel Observa` should collect, normalize and expose evidence.

## Rule 1 - Never Interpret

`Otiniel Observa` must not generate strategic meaning.
It may classify:
- source type
- evidence level
- completeness

It may not claim:
- why performance changed
- what should be done next
- whether a thesis is strong or weak

## Rule 2 - Preserve Source Lineage

Every observation must remain traceable to:
- where it came from
- when it was collected
- what period it represents
- which client observation profile produced it when applicable

## Rule 3 - Preserve Missingness

Missing data is part of the product.
If site or business data is absent, the record must say so explicitly.

## Rule 4 - Normalize, Do Not Flatten Blindly

Normalization should make evidence comparable without pretending all providers are equivalent.

Examples:
- views and impressions are not automatically interchangeable
- profile visits and landing page sessions are not the same behavior

## Rule 5 - Keep Windows Explicit

No observation should be consumed without a declared period.

Required:
- `period_start`
- `period_end`
- `window_type`

## Rule 6 - Manual Evidence Is Valid

Manual evidence is acceptable when:
- integrations do not exist
- clients only provide exports
- qualitative signals come from human operations

Manual evidence must be tagged clearly.

## Rule 7 - Multi-Client Isolation Is Mandatory

`Otiniel Observa` must treat every collection path as client-scoped.
Connector-based evidence should run through observation profiles tied to a client and one provider/account context.

Do not model client connectivity through ad hoc per-client environment variables.

## Rule 8 - Client Secrets Must Resolve Through References

Per-client tokens, refresh tokens and provider account secrets must be referenced by `secret_ref`.
Operating documentation and normalized records must not depend on raw secret values.

## Rule 9 - Summaries Must Stay Reversible

A summary should be explainable back to the observations that created it.

## Rule 10 - Comparison Requires Compatibility

Do not compare:
- different window lengths
- incompatible evidence levels
- incompatible metric definitions

without explicit qualification.

## Rule 11 - Live-First Connector Execution

For providers with supported live integrations (`meta`, `ga4`):
- collect from official APIs first when `secret_ref` is resolvable;
- only use metadata snapshot fallback when live collection fails or is intentionally disabled;
- include the collection provenance in run evidence using `collectionSource` with one of:
  - `live_api`
  - `metadata_snapshot`
  - `mock_collection`

Fallback must preserve continuity of downstream operations and update the canonical preview artifact in place.

## Quality Rules

Every summary should:
- expose source count
- expose completeness
- expose evidence level
- stay free from inferred strategic meaning

## Anti-Patterns

Never:
- overwrite raw signals with “cleaned” guesses
- promote screenshots to API-equivalent evidence without qualification
- hide collection failures
- create env-variable sprawl such as one provider token per client in platform config

Always:
- state what was unavailable
- state what was partial
- preserve source identity
- preserve client/profile identity for connector-based evidence
