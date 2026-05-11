# Handoff

Last updated: 2026-03-30

## Context

This repo is an OpenSquad workspace with a backend and a translated dashboard. The current work centered on making the web dashboard fully usable in pt-BR and keeping the session recoverable without relying on chat history.

## Completed

- Dashboard UI translated to pt-BR.
- Central locale catalog created at `dashboard/src/i18n/pt-BR.ts`.
- Main dashboard surfaces now consume the locale catalog:
  - `dashboard/src/App.tsx`
  - `dashboard/src/components/SquadSelector.tsx`
  - `dashboard/src/components/StatusBar.tsx`
  - `dashboard/src/office/OfficeScene.tsx`
  - `dashboard/src/components/BackendOpsPanel.tsx`
- Example seed values moved into the locale catalog.
- Generic API errors in `dashboard/src/lib/backendApi.ts` now render in pt-BR.
- Local storage session keys were renamed to `opensquad.*` with backward-compatible reads from the legacy `socialGrowth.*` keys.
- Validation passed with `cd dashboard && npm run build`.

## Current State

- Web dashboard remains available as the visual interface.
- Terminal-based operation is not implemented yet, but it is a desired next step.
- The repository is in a clean state at the time of this handoff.

## Next Steps

1. Implement a terminal CLI for common operations.
2. Decide whether to keep expanding the pt-BR locale catalog or introduce a real i18n runtime.
3. Optionally clean up remaining internal naming to align with the `opensquad` branding.

## Suggested CLI Scope

- `opensquad login`
- `opensquad bootstrap`
- `opensquad client create`
- `opensquad brief create`
- `opensquad content-plan revise`
- `opensquad approval update`

## Validation Commands

- `cd dashboard && npm run build`

## Resume Prompt

If the session is lost, continue from this file and the current dashboard i18n work. The next implementation target is the terminal CLI, while preserving the web dashboard as the visual control surface.
