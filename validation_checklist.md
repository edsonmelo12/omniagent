# Validation Checklist

Use this checklist to verify the product after the recent adjustments.

## 1. Visual Consistency
- Open the dashboard on a large desktop viewport.
- Confirm the main taxonomy reads as `cliente`, `célula` e `área operacional`.
- Confirm the top-level copy does not expose `workspace` or `contexto` in public-facing labels.
- Confirm the critical navigation icons render without falling back to raw text.

## 2. Small Screen Behavior
- Open the dashboard on a narrow viewport.
- Confirm the sidebar, topbar, and main panels remain usable without overlap.
- Confirm loading cards and empty states still keep their hierarchy readable.
- Confirm the consultor panel and metrics panel remain scannable on a reduced width.

## 3. Client Flow
- Select a client from the client switcher.
- Confirm the selected client updates the hero, feed, timeline, and metrics context.
- Confirm the selection is reflected in the operational metrics as a persisted event.
- Switch between at least two clients and confirm the UI keeps the focus stable.

## 4. Consultant Flow
- Open the consultant panel and send a direct decision request.
- Confirm the assistant answers with a recommendation, risk, and next step.
- Confirm the assistant does not rely on a chain of micro questions.
- Clear the conversation and verify the state resets cleanly.

## 5. Operational Metrics
- Open the metrics panel with no prior activity and confirm the empty state is explicit.
- Generate activity by opening the console, selecting a client, and sending a consultant question.
- Confirm the metrics update with console opens, client selections, and question events.
- Confirm load failure states are represented only when a real error is present.

## 6. Fallbacks and Recovery
- Simulate a loading state and confirm the fallback copy is operational, not technical.
- Confirm the dashboard still presents a sensible view if the backend context is unavailable.
- Confirm the icon fallback remains visually acceptable when a name is not mapped locally.

## 7. Acceptance Signal
- The dashboard should feel like a finished product, not a prototype.
- The consultant should reduce ambiguity instead of adding extra friction.
- The metrics panel should explain usage and reliability at a glance.
