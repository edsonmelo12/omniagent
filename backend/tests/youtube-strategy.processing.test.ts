import assert from "node:assert/strict";
import test from "node:test";
import {
  dedupeYoutubeVideoUrls,
  buildTranscriptFingerprint,
  compareYoutubeVideoProcessing,
  getVideoIdFromUrl,
} from "../src/modules/youtube-strategy/youtube-strategy.service.js";
import type { YoutubeStrategyVideoStateRow } from "../src/modules/youtube-strategy/youtube-strategy.repository.js";

const makeState = (overrides: Partial<YoutubeStrategyVideoStateRow> = {}): YoutubeStrategyVideoStateRow =>
  ({
    id: "state-1",
    client_id: "client-1",
    video_id: "video-1",
    canonical_url: "https://www.youtube.com/watch?v=video-1",
    transcript_hash: buildTranscriptFingerprint({
      status: "available",
      text: "hello world",
    }),
    transcript_status: "available",
    transcript_character_count: 11,
    transcript_segment_count: 1,
    last_analysis_id: "analysis-1",
    last_analysis_version: 1,
    last_processed_at: "2026-04-01T00:00:00.000Z",
    last_seen_at: "2026-04-01T00:00:00.000Z",
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
    ...overrides,
  }) as YoutubeStrategyVideoStateRow;

test("normaliza URLs do YouTube para o mesmo videoId", () => {
  assert.equal(getVideoIdFromUrl("https://www.youtube.com/watch?v=abc123&t=15s"), "abc123");
  assert.equal(getVideoIdFromUrl("https://youtu.be/abc123?si=shared"), "abc123");
  assert.equal(getVideoIdFromUrl("https://www.youtube.com/shorts/abc123?feature=share"), "abc123");
});

test("remove URLs duplicadas que apontam para o mesmo videoId", () => {
  const deduped = dedupeYoutubeVideoUrls([
    "https://www.youtube.com/watch?v=abc123&t=15s",
    "https://youtu.be/abc123?si=shared",
    "https://www.youtube.com/shorts/xyz789?feature=share",
    "https://www.youtube.com/watch?v=xyz789",
    "https://example.com/not-youtube",
    "https://example.com/not-youtube",
  ]);

  assert.deepEqual(deduped, [
    "https://www.youtube.com/watch?v=abc123&t=15s",
    "https://www.youtube.com/shorts/xyz789?feature=share",
    "https://example.com/not-youtube",
  ]);
});

test("gera o mesmo fingerprint para transcricoes equivalentes", () => {
  const first = buildTranscriptFingerprint({
    status: "available",
    text: "  Hello   world\n\nfrom   YouTube  ",
  });
  const second = buildTranscriptFingerprint({
    status: "available",
    text: "hello world from youtube",
  });

  assert.equal(first, second);
});

test("gera fingerprint diferente quando a transcricao muda de forma relevante", () => {
  const first = buildTranscriptFingerprint({
    status: "available",
    text: "hello world from youtube",
  });
  const second = buildTranscriptFingerprint({
    status: "available",
    text: "hello universe from youtube",
  });

  assert.notEqual(first, second);
});

test("reutiliza analise quando o fingerprint nao mudou", () => {
  const current = buildTranscriptFingerprint({
    status: "available",
    text: "hello world",
  });
  const comparison = compareYoutubeVideoProcessing({
    transcriptFingerprint: current,
    existingState: makeState(),
  });

  assert.equal(comparison.status, "reused");
  assert.equal(comparison.hasRelevantChange, false);
  assert.equal(comparison.previousAnalysisId, "analysis-1");
});

test("marca nova analise quando o fingerprint mudou", () => {
  const comparison = compareYoutubeVideoProcessing({
    transcriptFingerprint: buildTranscriptFingerprint({
      status: "available",
      text: "hello universe",
    }),
    existingState: makeState(),
  });

  assert.equal(comparison.status, "changed");
  assert.equal(comparison.hasRelevantChange, true);
  assert.equal(comparison.previousAnalysisVersion, 1);
});

test("marca video novo quando nao existe estado anterior", () => {
  const comparison = compareYoutubeVideoProcessing({
    transcriptFingerprint: buildTranscriptFingerprint({
      status: "available",
      text: "hello world",
    }),
    existingState: null,
  });

  assert.equal(comparison.status, "new");
  assert.equal(comparison.hasRelevantChange, true);
  assert.equal(comparison.previousAnalysisId, null);
});
