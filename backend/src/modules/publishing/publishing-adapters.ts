import { env } from "../../app/env.js";
import { getSecretString, type PublishingSecretResolution } from "./publishing-secrets.js";
import type { PublishingManifest } from "./publishing-manifest.js";

type PublishingProfile = {
  id: string;
  channel: string;
  provider: string;
  account_label: string;
  external_account_id: string | null;
};

export type PublishingAdapterResult = {
  adapter: string;
  channel: string;
  provider: string;
  liveSupported: boolean;
  status: "published" | "dry_run_passed" | "handoff_required" | "blocked";
  externalPostId: string | null;
  message: string;
  blockers: string[];
  warnings: string[];
  requests: Array<{
    method: string;
    url: string;
    summary: string;
  }>;
};

const getMetaGraphApiVersion = () => env.META_GRAPH_API_VERSION.trim();

const buildUrlEncodedBody = (payload: Record<string, string>) => {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    body.set(key, value);
  }
  return body;
};

const readJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const executeManualAdapter = (input: {
  mode: "dry_run" | "live";
  profile: PublishingProfile;
  manifest: PublishingManifest;
}): PublishingAdapterResult => {
  if (input.mode === "live") {
    return {
      adapter: "manual-handoff",
      channel: input.profile.channel,
      provider: input.profile.provider,
      liveSupported: false,
      status: "handoff_required",
      externalPostId: null,
      message: "Manual profile requires external handoff for publication.",
      blockers: [],
      warnings: ["The publication package is ready, but this profile does not publish directly from the backend."],
      requests: [],
    };
  }

  return {
    adapter: "manual-handoff",
    channel: input.profile.channel,
    provider: input.profile.provider,
    liveSupported: false,
    status: "dry_run_passed",
    externalPostId: null,
    message: "Manual publishing package validated successfully.",
    blockers: [],
    warnings: [],
    requests: [],
  };
};

const executeMetaGraphAdapter = async (input: {
  mode: "dry_run" | "live";
  profile: PublishingProfile;
  manifest: PublishingManifest;
  secretResolution: PublishingSecretResolution;
}): Promise<PublishingAdapterResult> => {
  const accessToken = getSecretString(input.secretResolution.secret, ["accessToken", "token", "metaAccessToken"]);
  const instagramBusinessAccountId =
    input.profile.external_account_id ??
    getSecretString(input.secretResolution.secret, [
      "instagramBusinessAccountId",
      "businessAccountId",
      "accountId",
    ]);
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!accessToken) {
    blockers.push("Meta Graph adapter requires an access token in the resolved secret");
  }

  if (!instagramBusinessAccountId) {
    blockers.push("Meta Graph adapter requires an Instagram business account id");
  }

  if (!input.manifest.asset?.publicUrl) {
    blockers.push("Meta Graph adapter requires a public media URL in the rendered asset payload");
  }

  if (input.manifest.format !== "post" && input.manifest.format !== "single" && input.manifest.format !== "image") {
    warnings.push("Meta Graph live adapter currently supports single image posts only.");
  }

  if (input.mode === "dry_run" || blockers.length > 0) {
    return {
      adapter: "meta-graph-instagram-image",
      channel: input.profile.channel,
      provider: input.profile.provider,
      liveSupported: blockers.length === 0,
      status: blockers.length > 0 ? "blocked" : "dry_run_passed",
      externalPostId: null,
      message:
        blockers.length > 0
          ? "Meta Graph adapter is not ready for live publication."
          : "Meta Graph adapter validated successfully for live publication.",
      blockers,
      warnings,
      requests: [
        {
          method: "POST",
          url: `https://graph.facebook.com/${getMetaGraphApiVersion()}/${instagramBusinessAccountId ?? "{instagram-account-id}"}/media`,
          summary: "Create Instagram media container with image_url and caption",
        },
        {
          method: "POST",
          url: `https://graph.facebook.com/${getMetaGraphApiVersion()}/${instagramBusinessAccountId ?? "{instagram-account-id}"}/media_publish`,
          summary: "Publish Instagram media container",
        },
      ],
    };
  }

  const publicUrl = input.manifest.asset?.publicUrl;
  if (!publicUrl || !accessToken) {
    return {
      adapter: "meta-graph-instagram-image",
      channel: input.profile.channel,
      provider: input.profile.provider,
      liveSupported: false,
      status: "blocked",
      externalPostId: null,
      message: "Meta Graph adapter could not start because required credentials or media are missing.",
      blockers: ["Missing public media URL or access token for Meta Graph live publication."],
      warnings,
      requests: [],
    };
  }

  const createMediaUrl = `https://graph.facebook.com/${getMetaGraphApiVersion()}/${instagramBusinessAccountId}/media`;
  const publishMediaUrl = `https://graph.facebook.com/${getMetaGraphApiVersion()}/${instagramBusinessAccountId}/media_publish`;

  const createMediaResponse = await fetch(createMediaUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: buildUrlEncodedBody({
      image_url: publicUrl,
      caption: `${input.manifest.caption}\n\n${input.manifest.hashtags.join(" ")}`.trim(),
      access_token: accessToken,
    }),
  });

  const createMediaPayload = await readJson(createMediaResponse);
  const creationId = typeof (createMediaPayload as Record<string, unknown> | null)?.id === "string"
    ? ((createMediaPayload as Record<string, unknown>).id as string)
    : null;

  if (!createMediaResponse.ok || !creationId) {
    return {
      adapter: "meta-graph-instagram-image",
      channel: input.profile.channel,
      provider: input.profile.provider,
      liveSupported: true,
      status: "blocked",
      externalPostId: null,
      message: "Meta Graph media container creation failed.",
      blockers: [
        `Meta Graph returned ${createMediaResponse.status} while creating the media container.`,
      ],
      warnings,
      requests: [
        {
          method: "POST",
          url: createMediaUrl,
          summary: "Create Instagram media container with image_url and caption",
        },
      ],
    };
  }

  const publishMediaResponse = await fetch(publishMediaUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: buildUrlEncodedBody({
      creation_id: creationId,
      access_token: accessToken,
    }),
  });

  const publishMediaPayload = await readJson(publishMediaResponse);
  const externalPostId = typeof (publishMediaPayload as Record<string, unknown> | null)?.id === "string"
    ? ((publishMediaPayload as Record<string, unknown>).id as string)
    : creationId;

  if (!publishMediaResponse.ok) {
    return {
      adapter: "meta-graph-instagram-image",
      channel: input.profile.channel,
      provider: input.profile.provider,
      liveSupported: true,
      status: "blocked",
      externalPostId: null,
      message: "Meta Graph media publish call failed.",
      blockers: [
        `Meta Graph returned ${publishMediaResponse.status} while publishing the media container.`,
      ],
      warnings,
      requests: [
        {
          method: "POST",
          url: createMediaUrl,
          summary: "Create Instagram media container with image_url and caption",
        },
        {
          method: "POST",
          url: publishMediaUrl,
          summary: "Publish Instagram media container",
        },
      ],
    };
  }

  return {
    adapter: "meta-graph-instagram-image",
    channel: input.profile.channel,
    provider: input.profile.provider,
    liveSupported: true,
    status: "published",
    externalPostId,
    message: "Instagram publication completed via Meta Graph.",
    blockers: [],
    warnings,
    requests: [
      {
        method: "POST",
        url: createMediaUrl,
        summary: "Create Instagram media container with image_url and caption",
      },
      {
        method: "POST",
        url: publishMediaUrl,
        summary: "Publish Instagram media container",
      },
    ],
  };
};

const executeUnsupportedAdapter = (input: {
  mode: "dry_run" | "live";
  profile: PublishingProfile;
}): PublishingAdapterResult => ({
  adapter: `${input.profile.provider}-adapter`,
  channel: input.profile.channel,
  provider: input.profile.provider,
  liveSupported: false,
  status: input.mode === "live" ? "handoff_required" : "dry_run_passed",
  externalPostId: null,
  message: "This provider is registered, but live publishing is not implemented in the backend yet.",
  blockers: [],
  warnings: ["Use this profile for validation now and connect a dedicated channel adapter before enabling automated live execution."],
  requests: [],
});

export const executePublishingAdapter = async (input: {
  mode: "dry_run" | "live";
  profile: PublishingProfile;
  manifest: PublishingManifest;
  secretResolution: PublishingSecretResolution;
}) => {
  if (input.profile.provider === "manual") {
    return executeManualAdapter(input);
  }

  if (input.profile.provider === "meta_graph") {
    return executeMetaGraphAdapter(input);
  }

  return executeUnsupportedAdapter(input);
};
