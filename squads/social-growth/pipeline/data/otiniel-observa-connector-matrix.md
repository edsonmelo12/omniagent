# Otiniel Observa - Connector Matrix

## Purpose

Define which connectors belong in each implementation phase and what each connector must provide.

## Prioritization Rule

Choose connectors by analytical value and operational stability, not by novelty.

## MVP Connectors

### 1. Meta

Why:
- high value for Instagram and Facebook clients
- strong overlap with the current product shape

Minimum fields:
- account/page reference
- impressions
- reach
- saves
- shares
- comments
- profile visits
- link clicks when available

Profile metadata:
- provider: `meta`
- channel: `instagram` or `facebook`
- account ref
- secret ref

### 2. GA4

Why:
- mandatory to connect content with site behavior

Minimum fields:
- property ref
- sessions
- engaged users
- engagement time
- source / medium
- campaign
- landing page
- key events
- conversions

Profile metadata:
- provider: `ga4`
- channel: `site`
- property ref
- secret ref

### 3. One CRM

Why:
- needed to close the loop between content and business signals when a client has CRM access

Minimum fields:
- lead count
- meeting count
- opportunity count
- proposal or deal progression

Profile metadata:
- provider: `crm`
- channel: `business`
- account/workspace ref
- secret ref

## Phase 2 Connectors

### LinkedIn

Add when provider access and client demand justify it.

### YouTube

Add when video is materially relevant for the client base.

### Search / Discoverability Inputs

Add when the product wants site/entity visibility beyond core social + site + CRM loops.

## Manual Sources That Must Remain Supported

- CSV uploads
- spreadsheet imports
- form-based qualitative submissions
- screenshot-reviewed evidence

## Connector Readiness Checklist

Before promoting a connector to supported status:
- profile can be validated
- collection can run on a declared period
- normalization rules are documented
- evidence level is assigned consistently
- failures degrade profile status visibly

## Core Analysis Threshold

For core observation readiness, Meta and GA4 are the required baseline.
CRM is valuable, but optional for declaring a client testable.

## Output Requirement

Every connector must feed:
- raw evidence records
- normalized observation records
- summary windows

No connector should bypass the normalized contract.
