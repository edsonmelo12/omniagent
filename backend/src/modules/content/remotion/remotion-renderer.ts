import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { buildCopyMotionNarration } from "./copy-motion-video.js";
import type { CopyMotionVideoProps } from "./copy-motion-video.js";
import {
  REMOTION_COMPOSITION_ID,
  REMOTION_DURATION_IN_FRAMES,
  REMOTION_FPS,
  REMOTION_HEIGHT,
  REMOTION_WIDTH,
} from "./remotion-root.js";

const resolveEntryPoint = () => {
  const baseDir = process.cwd();
  const candidates = [
    join(baseDir, "src/modules/content/remotion/remotion-root.tsx"),
    join(baseDir, "src/modules/content/remotion/remotion-root.ts"),
    join(baseDir, "src/modules/content/remotion/remotion-root.js"),
    join(baseDir, "dist/modules/content/remotion/remotion-root.js"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const fallback = fileURLToPath(new URL("./remotion-root.tsx", import.meta.url));
  return fallback;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const writeUInt32LE = (buffer: Buffer, value: number, offset: number) => {
  buffer.writeUInt32LE(value >>> 0, offset);
};

const writeUInt16LE = (buffer: Buffer, value: number, offset: number) => {
  buffer.writeUInt16LE(value >>> 0, offset);
};

const formatTimestamp = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds - Math.floor(safeSeconds)) * 1000);
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
    .concat(`,${String(milliseconds).padStart(3, "0")}`);
};

const buildSrtFromNarration = (input: {
  fps: number;
  narration: ReturnType<typeof buildCopyMotionNarration>;
}) => {
  const sceneOffsets: Record<string, number> = { hero: 0, lead: 72, support: 156, close: 202 };
  const lines = [
    ...input.narration.hero.map((line) => ({ ...line, scene: "hero" })),
    ...input.narration.lead.map((line) => ({ ...line, scene: "lead" })),
    ...input.narration.support.map((line) => ({ ...line, scene: "support" })),
    ...input.narration.close.map((line) => ({ ...line, scene: "close" })),
  ].map((line) => {
    const offset = sceneOffsets[line.scene] ?? 0;
    const start = (offset + line.from) / input.fps;
    const end = (offset + line.from + line.duration) / input.fps;
    return {
      start,
      end,
      text: line.text,
    };
  });

  return lines
    .map((line, index) => `${index + 1}\n${formatTimestamp(line.start)} --> ${formatTimestamp(line.end)}\n${line.text}\n`)
    .join("\n");
};

const createAmbientSoundtrack = async (input: {
  outputPath: string;
  fps: number;
  durationInFrames: number;
}) => {
  const sampleRate = 44100;
  const durationSeconds = input.durationInFrames / input.fps;
  const sampleCount = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  writeUInt32LE(buffer, 36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  writeUInt32LE(buffer, 16, 16);
  writeUInt16LE(buffer, 1, 20);
  writeUInt16LE(buffer, 1, 22);
  writeUInt32LE(buffer, sampleRate, 24);
  writeUInt32LE(buffer, sampleRate * 2, 28);
  writeUInt16LE(buffer, 2, 32);
  writeUInt16LE(buffer, 16, 34);
  buffer.write("data", 36, "ascii");
  writeUInt32LE(buffer, dataSize, 40);

  const chord = [220, 277.18, 329.63];

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const fadeIn = Math.min(1, t / 1.1);
    const fadeOut = Math.min(1, Math.max(0, (durationSeconds - t) / 1.35));
    const envelope = clamp01(fadeIn * fadeOut);
    const pulse = 0.76 + 0.24 * Math.sin(2 * Math.PI * 0.18 * t);
    const shimmer = Math.sin(2 * Math.PI * 0.07 * t) * 0.04;
    const tone =
      chord.reduce((sum, freq, index) => {
        const weight = [0.52, 0.32, 0.24][index] ?? 0.2;
        return sum + Math.sin(2 * Math.PI * freq * t) * weight;
      }, 0) / 1.08;
    const grain = Math.sin(2 * Math.PI * 880 * t) * 0.015;
    const sample = Math.max(-1, Math.min(1, (tone * pulse + shimmer + grain) * envelope * 0.2));
    const pcm = Math.round(sample * 32767);
    buffer.writeInt16LE(pcm, 44 + i * 2);
  }

  await writeFile(input.outputPath, buffer);
  return input.outputPath;
};

export type RenderedMotionAsset = {
  assetPath: string;
  assetMimeType: string;
  assetFormat: string;
  assetWidth: number;
  assetHeight: number;
  renderEngine: string;
  subtitlePath: string;
  soundtrackPath: string;
};

export const renderCopyMotionVideo = async (input: {
  outputLocation: string;
  props: CopyMotionVideoProps;
}) => {
  await mkdir(dirname(input.outputLocation), { recursive: true });
  const narration = buildCopyMotionNarration({
    leadHook: input.props.leadSignal?.hook ?? null,
    focusItem: input.props.focusItem ?? null,
    artDirection: input.props.artDirection ?? null,
    regenerationMode: input.props.regenerationMode ?? null,
    regenerationNote: input.props.regenerationNote ?? null,
  });
  const soundtrackPath = await createAmbientSoundtrack({
    outputPath: input.outputLocation.replace(/\.mp4$/i, ".wav"),
    fps: REMOTION_FPS,
    durationInFrames: REMOTION_DURATION_IN_FRAMES,
  });
  const soundtrackDataUrl = `data:audio/wav;base64,${(await readFile(soundtrackPath)).toString("base64")}`;
  const subtitlePath = input.outputLocation.replace(/\.mp4$/i, ".srt");
  await writeFile(subtitlePath, buildSrtFromNarration({ fps: REMOTION_FPS, narration }), "utf8");

  const serveUrl = await bundle({
    entryPoint: resolveEntryPoint(),
    onProgress: () => undefined,
  });

  const composition = await selectComposition({
    serveUrl,
    id: REMOTION_COMPOSITION_ID,
    inputProps: {
      ...input.props,
      soundtrackPath: soundtrackDataUrl,
      soundtrackVolume: 0.12,
    },
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: input.outputLocation,
    inputProps: {
      ...input.props,
      soundtrackPath: soundtrackDataUrl,
      soundtrackVolume: 0.12,
    },
    overwrite: true,
  });

  return {
    assetPath: input.outputLocation,
    assetMimeType: "video/mp4",
    assetFormat: "mp4",
    assetWidth: REMOTION_WIDTH,
    assetHeight: REMOTION_HEIGHT,
    renderEngine: "remotion",
    subtitlePath,
    soundtrackPath,
  } satisfies RenderedMotionAsset;
};

export const getRemotionRenderDefaults = () => ({
  fps: REMOTION_FPS,
  durationInFrames: REMOTION_DURATION_IN_FRAMES,
  width: REMOTION_WIDTH,
  height: REMOTION_HEIGHT,
});
