# MVP Roadmap

## Goal

Deliver the smallest version of the multi-agency platform that already feels like a professional product:
- login
- agency isolation
- client workspaces
- automatic social intelligence
- editable client record
- blog drafting
- discovery optimization
- content repurposing
- optional proposal generation
- simple dashboard

## Phase 1 - Foundation

### Outcomes
- users can log in
- agencies exist as isolated tenants
- clients can be created under an agency
- profile and workspace data are stored in PostgreSQL

### Deliverables
- authentication
- agency management
- user memberships
- client records
- basic role-based access

## Phase 2 - Intelligence

### Outcomes
- the system can discover official social profiles
- the system can collect public signals
- the system can store a structured social intelligence snapshot

### Deliverables
- social discovery step
- social intelligence intake
- evidence storage
- confidence labeling

## Phase 3 - Client Record and Proposal

### Outcomes
- the client record is editable and versioned
- the proposal is generated from evidence when requested
- the proposal chooses an archetype

### Deliverables
- editable client record
- market research record
- blog draft workflow
- discovery optimization workflow
- content repurposing workflow
- proposal generator
- 7-slide presentation output

## Phase 4 - Monitoring and Dashboard

### Outcomes
- the client and agency can see the status of the cycle
- performance and actions are visible in one place

### Deliverables
- monitoring summaries
- approval history
- dashboard overview
- basic reporting

## Phase 5 - Expansion

### Outcomes
- the platform becomes multi-agency ready at scale
- the dashboard becomes the main operating surface

### Deliverables
- richer permissions
- template library
- comparison views
- optional billing and plan management

## Build Order Recommendation

1. PostgreSQL schema
2. Authentication and tenants
3. Client workspace and client record
4. Social intelligence collection
5. Blog draft, discovery optimization and repurposing
6. Optional proposal generation
7. Monitoring
8. Dashboard UI

## Success Criteria

- the system can onboard a client without manual file juggling
- the system can produce a proposal from evidence when needed
- the agency can see every client cycle in a single view
- the platform can grow into a real multi-agency product
