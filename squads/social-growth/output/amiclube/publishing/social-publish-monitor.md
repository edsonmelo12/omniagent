# Social Publish Monitor

## Summary
- Status: FAILED
- Timestamp (UTC): 2026-05-19T12:50:01.123Z
- Grace Window (minutes): 90
- Queue Rows: 19

## Queue Snapshot
| asset_id | channel | publish_at_iso | status | dispatch_mode | last_result |
|---|---|---|---|---|---|
| AC-30-04 | facebook | 2026-05-03T10:00:00-03:00 | blocked | connector_api | missing_final_caption |
| AC-30-03 | instagram | 2026-05-04T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-19 | instagram | 2026-05-05T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-34 | facebook | 2026-05-06T10:00:00-03:00 | published | connector_api | dry_run_ok:{"credentials":true,"assets_exported":true,"asset_count":1,"min_required":1,"caption_ready":true,"final_caption_ready":true,"channel":"facebook"} |
| AC-30-20 | instagram | 2026-05-06T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-17 | instagram | 2026-05-07T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-18 | instagram | 2026-05-08T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-06 | instagram | 2026-05-10T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-07 | instagram | 2026-05-11T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-08 | instagram | 2026-05-12T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-31 | instagram | 2026-05-13T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-32 | instagram | 2026-05-14T18:30:00-03:00 | published | connector_api | published_ok |
| AC-30-33 | facebook | 2026-05-15T10:00:00-03:00 | published | connector_api | published_ok |
| AC-30-36 | facebook | 2026-05-18T10:00:00-03:00 | published | connector_api | published_ok |
| AC-30-29 | instagram | 2026-05-19T18:30:00-03:00 | scheduled | connector_api | - |
| AC-30-32 | instagram | 2026-05-20T18:30:00-03:00 | scheduled | connector_api | - |
| AC-30-33 | facebook | 2026-05-21T10:00:00-03:00 | scheduled | connector_api | - |
| AC-30-28 | instagram | 2026-05-22T18:30:00-03:00 | scheduled | connector_api | - |
| AC-30-30 | facebook | 2026-05-23T10:00:00-03:00 | scheduled | connector_api | - |

## Critical
- AC-30-04: blocked (missing_final_caption)

## Warning
- queue build warning: asset AC-30-04 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-03 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-19 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-34 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-20 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-17 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-18 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-06 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-07 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-08 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-31 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-32 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-33 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-28 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-30 recovered from existing PNG files because manifest row was missing
- queue build warning: asset AC-30-36 recovered from existing PNG files because manifest row was missing
- queue build warning: pending_caption:AC-30-04-2026-05-03-1000 — asset has export but no caption in queue

## Info
- AC-30-29: aguardando janela.
- AC-30-32: aguardando janela.
- AC-30-33: aguardando janela.
- AC-30-28: aguardando janela.
- AC-30-30: aguardando janela.
