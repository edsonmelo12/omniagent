import {
  getRenderedAssetFileInfo,
  getRenderedAssetManifest,
  hasRenderedAssetFile,
  type RenderedAssetRow,
} from "../content/rendered-assets.service.js";

type ScheduleItem = {
  position?: number;
  date?: string;
  channel?: string;
  title?: string;
  pillar?: string;
  angle?: string;
  objective?: string;
  reason?: string;
  format?: string;
  hook?: string;
  proof?: string;
  cta?: string;
  visualCue?: string;
  status?: string;
};

type SchedulePayload = {
  cadence?: string;
  items?: ScheduleItem[];
};

type ContentPackagePayload = {
  visualDirection?: {
    title?: string;
    contentRhythm?: string;
    supportChannels?: string[];
  };
};

export type PublishingManifestAsset = {
  renderedAssetId: string | null;
  assetPath: string | null;
  assetMimeType: string | null;
  assetFormat: string | null;
  assetWidth: number | null;
  assetHeight: number | null;
  previewDataUrl: string | null;
  previewMimeType: string | null;
  publicUrl: string | null;
};

export type PublishingManifest = {
  channel: string;
  publishAt: string | null;
  title: string;
  format: string;
  pillar: string;
  angle: string;
  objective: string;
  caption: string;
  hashtags: string[];
  asset: PublishingManifestAsset | null;
  source: {
    scheduleItemPosition: number | null;
    contentRhythm: string | null;
    supportChannels: string[];
  };
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const safeText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback);

const normalizeChannel = (value: string) => value.trim().toLowerCase();

const buildCaption = (item: ScheduleItem, clientName: string) => {
  const lines = [
    safeText(item.hook),
    safeText(item.objective),
    safeText(item.proof),
    safeText(item.cta),
  ].filter((line) => line.length > 0);

  if (lines.length > 0) {
    return lines.join("\n");
  }

  return [safeText(item.title, clientName), safeText(item.reason)].filter(Boolean).join("\n");
};

const buildHashtags = (item: ScheduleItem, clientName: string) => {
  const candidates = [item.channel, item.pillar, item.angle, clientName]
    .map((value) => safeText(value))
    .map((value) => value.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi, " ").trim())
    .filter(Boolean)
    .map((value) => `#${value.replace(/\s+/g, "")}`);

  return Array.from(new Set(candidates)).slice(0, 5);
};

const getPublicUrlFromRenderedAsset = (asset: RenderedAssetRow) => {
  const manifest = getRenderedAssetManifest(asset);
  const manifestRecord = asRecord(manifest);
  const payloadRecord = asRecord(asset.payload_json);

  const candidates = [
    manifestRecord?.publicAssetUrl,
    manifestRecord?.assetUrl,
    payloadRecord?.publicAssetUrl,
    payloadRecord?.assetUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^https?:\/\//i.test(candidate.trim())) {
      return candidate.trim();
    }
  }

  return null;
};

const selectRenderedAsset = (channel: string, renderedAssets: RenderedAssetRow[]) => {
  const normalizedChannel = normalizeChannel(channel);
  const ranked = renderedAssets
    .filter((asset) => asset.status === "ready" || asset.status === "approved" || asset.status === "queued")
    .map((asset) => {
      const manifest = getRenderedAssetManifest(asset);
      const manifestChannel = safeText(manifest?.focusItem?.channel).toLowerCase();
      const hasFile = hasRenderedAssetFile(asset);
      return {
        asset,
        score: (manifestChannel === normalizedChannel ? 4 : 0) + (hasFile ? 2 : 0) + (asset.preview_data_url ? 1 : 0),
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.asset.version - left.asset.version;
    });

  return ranked[0]?.asset ?? null;
};

export const buildPublishingManifest = (input: {
  clientName: string;
  channel: string;
  schedulePayload: SchedulePayload | null;
  contentPackagePayload: ContentPackagePayload | null;
  renderedAssets: RenderedAssetRow[];
}) => {
  const normalizedChannel = normalizeChannel(input.channel);
  const scheduleItems = Array.isArray(input.schedulePayload?.items) ? input.schedulePayload.items : [];
  const matchingItems = scheduleItems.filter((item) => normalizeChannel(safeText(item.channel, normalizedChannel)) === normalizedChannel);
  const primaryItem = matchingItems[0] ?? scheduleItems[0] ?? null;
  const renderedAsset = selectRenderedAsset(normalizedChannel, input.renderedAssets);
  const fileInfo = renderedAsset ? getRenderedAssetFileInfo(renderedAsset) : null;
  const asset =
    renderedAsset && fileInfo
      ? {
          renderedAssetId: renderedAsset.id,
          assetPath: fileInfo.assetPath,
          assetMimeType: fileInfo.assetMimeType,
          assetFormat: renderedAsset.asset_format ?? null,
          assetWidth: fileInfo.assetWidth,
          assetHeight: fileInfo.assetHeight,
          previewDataUrl: fileInfo.previewDataUrl,
          previewMimeType: fileInfo.previewMimeType,
          publicUrl: getPublicUrlFromRenderedAsset(renderedAsset),
        }
      : null;

  return {
    channel: normalizedChannel,
    publishAt: primaryItem?.date ?? null,
    title: safeText(primaryItem?.title, input.contentPackagePayload?.visualDirection?.title ?? input.clientName),
    format: safeText(primaryItem?.format, "post"),
    pillar: safeText(primaryItem?.pillar, "editorial"),
    angle: safeText(primaryItem?.angle, "positioning"),
    objective: safeText(primaryItem?.objective),
    caption: primaryItem ? buildCaption(primaryItem, input.clientName) : input.clientName,
    hashtags: primaryItem ? buildHashtags(primaryItem, input.clientName) : buildHashtags({ channel: normalizedChannel }, input.clientName),
    asset,
    source: {
      scheduleItemPosition: typeof primaryItem?.position === "number" ? primaryItem.position : null,
      contentRhythm: safeText(input.schedulePayload?.cadence, input.contentPackagePayload?.visualDirection?.contentRhythm ?? "") || null,
      supportChannels: input.contentPackagePayload?.visualDirection?.supportChannels ?? [],
    },
  } satisfies PublishingManifest;
};
