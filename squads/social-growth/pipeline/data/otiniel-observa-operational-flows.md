# Otiniel Observa - Operational Flows

## Purpose

Define the key operational flows required to run `Otiniel Observa`.

## Flow 1 - Create Observation Profile

1. Select client
2. Select provider and channel
3. Fill provider/account metadata
4. attach `secret_ref`
5. save as `pending`
6. run validation
7. if valid, move to `active`
8. if invalid, keep explicit failure state

### Baseline Rule

When the client has:
- official Instagram presence
- official Facebook presence
- site tracked by GA4

the default baseline is not complete until all 3 canonical profiles exist:
- `provider=meta`, `channel=instagram`
- `provider=meta`, `channel=facebook`
- `provider=ga4`, `channel=site`

Facebook page setup must persist the canonical page `account_ref` (page ID) instead of relying only on the public URL.

## Flow 2 - Validate Observation Profile

1. resolve `secret_ref`
2. test provider access
3. confirm account/property/workspace metadata
4. store validation result
5. update `last_validated_at`
6. set status:
   - `active`
   - `invalid`
   - `expired`

## Flow 3 - Manual Intake

1. choose client
2. choose source type
3. upload or submit structured evidence
4. create source and collection run
5. persist raw evidence
6. normalize observations
7. generate summaries
8. expose coverage state

## Flow 4 - Connector Collection

1. select active profile
2. resolve client secret through `secret_ref`
3. collect provider data for the requested period
4. persist raw evidence
5. normalize records
6. generate summaries
7. update `last_collected_at`
8. record success or failure

### Post-Fix Rule

If a connector issue was fixed by:
- code patch
- credential update
- API enablement
- corrected `account_ref` / `property_ref`

the operator must, in the same run:
1. rerun the affected collection
2. regenerate the summary window
3. refresh canonical artifacts:
   - `output/{client}/context/social-intelligence-summary.md`
   - `output/{client}/oto/observation-overview.md`
   - `output/{client}/oto/observation-overview.html`

## Flow 5 - Collection Failure

1. mark run as failed
2. persist error code and safe message
3. update profile status when the error is credential-related
4. keep prior summaries intact
5. surface gap in coverage output

## Flow 6 - Reprocess Summaries

1. select client and window
2. load relevant normalized observations
3. regenerate summary package
4. replace or version the summary record per implementation choice
5. mark generation timestamp

## Flow 7 - Secret Rotation

1. create or register new secret
2. update profile `secret_ref`
3. validate profile again
4. if valid, keep active
5. if invalid, revert status accordingly

## Flow 8 - Deactivate Profile

1. select profile
2. set status to `revoked` or equivalent
3. stop scheduled collection
4. preserve historical evidence
5. keep summaries readable for past periods

## Operating Rule

Every flow must preserve:
- agency context
- client context
- profile context when applicable
- period boundaries
- auditability

Readiness for "core observation" is only true when the client baseline required by its real channel footprint is fully represented in canonical profiles and the latest post-fix collections have been rerun.
