# Multi-Agency Platform Blueprint

## Purpose

Define the target product direction for the squad: a multi-agency platform with login, client workspaces, automatic social intelligence and optional commercial proposal generation.

This document is the product-level reference for moving the current document-based workflow toward a relational, dashboard-ready system.

## Product Vision

Turn the social-growth workflow into a professional SaaS-style platform where:
- each agency has its own workspace
- each client has isolated data and history
- social intelligence is collected automatically
- proposals are generated from evidence when needed
- dashboards summarize the real state of the account

## Why This Direction

The project started with Markdown artifacts for narrative delivery and early iteration.
That representation is not the right long-term runtime store for:
- structured data
- role-based access
- multi-client operations
- auditability
- dashboarding

The target architecture should therefore be:
- PostgreSQL as the relational core
- dashboard UI as the visual layer
- Markdown as an optional export/review layer

## MVP Scope

### Included
- login
- agency accounts
- client workspaces
- social profile discovery
- social intelligence snapshots
- editable client record
- market research
- commercial proposal module
- monitoring summary
- basic approval history

### Deferred
- billing
- advanced collaboration
- deep external API integrations
- template marketplace
- cross-agency benchmarking
- automated publishing integrations

## Core Entities

### Agency
- id
- name
- branding
- plan
- status

### User
- id
- name
- email
- role
- status

### Membership
- user_id
- agency_id
- role
- permissions

### Client
- id
- agency_id
- name
- website
- segment
- status

### Social Profile
- client_id
- platform
- handle
- url
- discovery_source
- status

### Social Intelligence Snapshot
- client_id
- collected_at
- confidence
- presence_score
- consistency_score
- proof_score
- conversion_readiness
- public_only
- notes

### Client Record
- client_id
- version
- key facts
- offer
- audience
- tone
- corrections

### Proposal
- client_id
- archetype
- thesis
- evidence summary
- recommended offer
- CTA
- status

### Monitoring Report
- client_id
- period
- KPIs
- interpretation
- actions

### Evidence
- source URL
- source type
- collection date
- confidence
- related record

## Permissions

### Admin Agency
- full access to the agency workspace
- manage users, clients, branding and settings

### Strategist
- edit briefs, research and proposals
- review intelligence summaries

### Social Media
- edit content plans, blog drafts, discovery-optimized posts, content repurpose packages and monitoring notes

### Reviewer
- approve or reject proposals and schedule outputs

### Client
- view their own workspace
- correct briefs
- approve proposals and schedules

### Viewer
- read-only access

## Screen Map

### Agency Area
- dashboard
- client list
- proposal list
- approvals
- monitoring overview

### Client Area
- client record
- intelligence summary
- market research
- proposal
- content plan
- schedule
- monitoring

### Operations Area
- source intake
- social discovery
- evidence review
- research
- proposal builder
- monitoring actions

## Workflow

1. Create agency and user membership.
2. Create client workspace.
3. Discover social profiles from the website and public web signals.
4. Collect social intelligence and store the snapshot.
5. Build or update the client record.
6. Run market research.
7. Optionally generate the commercial proposal.
8. Review and approve.
9. Plan content and schedule delivery.
10. Monitor results and repeat the cycle.

## Product Rules

- The platform must not require manual social searching before proposal creation.
- The proposal must read from the social intelligence snapshot when the proposal step is used.
- The client record remains a human-reviewed record in the database, with Markdown only as an optional rendered copy.
- Every important record must keep evidence and timestamps.
- Each agency sees only its own tenant data.

## Dashboard Views

### Agency Overview
- clients by status
- proposals in progress
- briefs needing attention
- social health by client
- cycle progress

### Client Overview
- current client record
- social health score
- proposal stage
- recent monitoring
- next actions

### Evidence View
- discovered profiles
- collected URLs
- public signals
- confirmed analytics
- confidence labels

## Recommended Tech Direction

- PostgreSQL for relational storage
- API layer for business logic
- web dashboard for operations
- Markdown exports for human-readable delivery
- file storage for evidence and attachments

## Roadmap

### Phase 1
- authentication
- agencies
- clients
- social profiles
- briefs

### Phase 2
- automatic social intelligence
- evidence storage
- proposal builder
- monitoring records

### Phase 3
- dashboard visual layer
- approvals
- reporting
- reusable templates

### Phase 4
- multi-agency scale
- role refinement
- deeper integrations
- optional billing

## Success Criteria

- The system can handle multiple agencies safely.
- The system can generate a proposal from evidence, not guesswork, when that module is invoked.
- The system can show a clear social health view per client.
- The system can keep human-readable documents and structured data aligned.

## Decision Log

- Chosen: multi-agency SaaS direction.
- Chosen: PostgreSQL as the canonical data layer.
- Chosen: Markdown stays as output and review material, not as the runtime source of truth for clients, products and services.
- Chosen: social intelligence must happen before optional proposal generation.
- Rejected: keeping the platform as only a document repository.
- Reason: it would block dashboards, permissions and scale.

## Final Recommendation

Build the product as a multi-tenant relational system first, then layer dashboards and richer automation on top.

That gives the squad a professional base without losing the current document-driven workflow during the transition.
