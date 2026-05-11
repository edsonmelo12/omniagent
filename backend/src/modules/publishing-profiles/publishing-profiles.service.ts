import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { getSecretString, resolvePublishingSecret } from "../publishing/publishing-secrets.js";
import {
  createPublishingProfileRecord,
  findPublishingProfileByClientAndChannel,
  findPublishingProfileById,
  listPublishingProfilesByClientId,
  type PublishingProfileRow,
  updatePublishingProfileRecord,
} from "./publishing-profiles.repository.js";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const toPublishingProfilePayload = (profile: PublishingProfileRow) => ({
  id: profile.id,
  client_id: profile.client_id,
  channel: profile.channel,
  provider: profile.provider,
  account_label: profile.account_label,
  external_account_id: profile.external_account_id,
  secret_ref: profile.secret_ref,
  connection_status: profile.connection_status,
  approval_mode: profile.approval_mode,
  publish_mode: profile.publish_mode,
  capabilities: asRecord(profile.capabilities_json),
  constraints: asRecord(profile.constraints_json),
  last_validated_at: profile.last_validated_at,
  last_error_code: profile.last_error_code,
  last_error_message: profile.last_error_message,
  created_at: profile.created_at,
  updated_at: profile.updated_at,
});

const inferRequiredScopesPresent = (profile: PublishingProfileRow, secretResolution: ReturnType<typeof resolvePublishingSecret>) => {
  if (profile.provider === "manual") {
    return true;
  }

  if (profile.provider === "meta_graph") {
    return Boolean(profile.external_account_id ?? getSecretString(secretResolution.secret, ["instagramBusinessAccountId", "accountId"])) &&
      Boolean(getSecretString(secretResolution.secret, ["accessToken", "token", "metaAccessToken"]));
  }

  if (profile.provider === "youtube_api") {
    return Boolean(getSecretString(secretResolution.secret, ["apiKey", "youtubeApiKey", "accessToken"]));
  }

  if (profile.provider === "linkedin_api") {
    return Boolean(getSecretString(secretResolution.secret, ["accessToken", "token"])) &&
      Boolean(profile.external_account_id ?? getSecretString(secretResolution.secret, ["authorUrn", "organizationUrn", "personUrn"]));
  }

  if (profile.provider === "rube" || profile.provider === "buffer") {
    return Boolean(getSecretString(secretResolution.secret, ["accessToken", "token", "apiKey"]));
  }

  return profile.connection_status === "active";
};

const validateSecretRefShape = (secretRef: string) =>
  /^(?:[a-z0-9][a-z0-9/_-]+|(?:env|aws-sm|vault|azure-kv|gcp-sm):\/\/[a-z0-9][a-z0-9/_:#.-]+)$/i.test(secretRef);

const buildValidationResult = (profile: PublishingProfileRow) => {
  const secretResolution = resolvePublishingSecret(profile.secret_ref);
  const secretResolved = validateSecretRefShape(profile.secret_ref) && secretResolution.resolved;
  const providerReachable = profile.provider === "manual" || secretResolution.resolved;
  const requiredScopesPresent = inferRequiredScopesPresent(profile, secretResolution);
  const activeConnection = secretResolved && providerReachable && requiredScopesPresent;

  return {
    connectionStatus: activeConnection ? "active" : profile.provider === "manual" ? "active" : "pending_auth",
    checks: {
      secretResolved,
      providerReachable,
      requiredScopesPresent,
    },
    secretResolution: {
      backend: secretResolution.backend,
      envKey: secretResolution.envKey,
      fields: secretResolution.fields,
      resolved: secretResolution.resolved,
      errorCode: secretResolution.errorCode,
    },
    lastErrorCode: activeConnection ? null : "PROFILE_VALIDATION_FAILED",
    lastErrorMessage: activeConnection
      ? null
      : "Publishing profile validation failed. Check secret_ref, provider readiness, or required account linkage.",
  };
};

export const getPublishingProfilesContext = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profiles = await listPublishingProfilesByClientId(input.clientId);

  return {
    client,
    profiles: profiles.map(toPublishingProfilePayload),
  };
};

export const createPublishingProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  channel: string;
  provider: string;
  accountLabel: string;
  externalAccountId?: string;
  secretRef: string;
  approvalMode: string;
  publishMode: string;
  capabilities: Record<string, unknown>;
  constraints: Record<string, unknown>;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const created = await createPublishingProfileRecord({
    clientId: input.clientId,
    channel: input.channel,
    provider: input.provider,
    accountLabel: input.accountLabel,
    externalAccountId: input.externalAccountId,
    secretRef: input.secretRef,
    approvalMode: input.approvalMode,
    publishMode: input.publishMode,
    capabilities: input.capabilities,
    constraints: input.constraints,
  });

  const profiles = await listPublishingProfilesByClientId(input.clientId);

  return {
    client,
    profile: toPublishingProfilePayload(created),
    profiles: profiles.map(toPublishingProfilePayload),
  };
};

export const revisePublishingProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  profileId: string;
  accountLabel?: string;
  externalAccountId?: string | null;
  secretRef?: string;
  connectionStatus?: string;
  approvalMode?: string;
  publishMode?: string;
  capabilities?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profile = await findPublishingProfileById(input.profileId);
  if (!profile || profile.client_id !== input.clientId) {
    throw createError("NOT_FOUND", "Publishing profile not found", 404);
  }

  const updated = await updatePublishingProfileRecord(input.profileId, {
    accountLabel: input.accountLabel,
    externalAccountId: input.externalAccountId,
    secretRef: input.secretRef,
    connectionStatus: input.connectionStatus,
    approvalMode: input.approvalMode,
    publishMode: input.publishMode,
    capabilities: input.capabilities,
    constraints: input.constraints,
    lastErrorCode: input.lastErrorCode,
    lastErrorMessage: input.lastErrorMessage,
  });

  if (!updated) {
    throw createError("NOT_FOUND", "Publishing profile not found", 404);
  }

  const profiles = await listPublishingProfilesByClientId(input.clientId);

  return {
    client,
    profile: toPublishingProfilePayload(updated),
    profiles: profiles.map(toPublishingProfilePayload),
  };
};

export const validatePublishingProfile = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  profileId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const profile = await findPublishingProfileById(input.profileId);
  if (!profile || profile.client_id !== input.clientId) {
    throw createError("NOT_FOUND", "Publishing profile not found", 404);
  }

  const validation = buildValidationResult(profile);
  const validatedAt = new Date().toISOString();

  const updated = await updatePublishingProfileRecord(input.profileId, {
    connectionStatus: validation.connectionStatus,
    lastValidatedAt: validatedAt,
    lastErrorCode: validation.lastErrorCode,
    lastErrorMessage: validation.lastErrorMessage,
  });

  if (!updated) {
    throw createError("NOT_FOUND", "Publishing profile not found", 404);
  }

  return {
    client,
    profile: toPublishingProfilePayload(updated),
    validation: {
      profileId: updated.id,
      channel: updated.channel,
      provider: updated.provider,
      connectionStatus: validation.connectionStatus,
      validatedAt,
      checks: validation.checks,
      secretResolution: validation.secretResolution,
    },
  };
};

export const resolvePublishingProfileForChannel = async (input: {
  clientId: string;
  channel: string;
}) => {
  const profile = await findPublishingProfileByClientAndChannel(input.clientId, input.channel);
  return profile ? toPublishingProfilePayload(profile) : null;
};
