import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestBriefByClientId, createBriefVersion, listBriefsByClientId, updateBriefVersion } from "./briefs.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
const chooseArchetype = (snapshot, profilesCount) => {
    if (!snapshot) {
        return "presenca";
    }
    const presence = snapshot.presence_score ?? 0;
    const consistency = snapshot.consistency_score ?? 0;
    const proof = snapshot.proof_score ?? 0;
    const conversion = snapshot.conversion_readiness ?? 0;
    if (profilesCount >= 4 && presence >= 80 && consistency >= 75 && proof >= 65 && conversion >= 70) {
        return "escala";
    }
    if (conversion >= 65) {
        return "conversao";
    }
    if (proof >= 60 || consistency >= 70) {
        return "autoridade";
    }
    return "presenca";
};
const buildBriefPayload = (input) => {
    const archetype = chooseArchetype(input.snapshot, input.profilesCount);
    const gaps = Array.isArray(input.snapshot?.main_gaps_json) ? input.snapshot?.main_gaps_json : [];
    const opportunities = Array.isArray(input.snapshot?.opportunity_notes_json) ? input.snapshot?.opportunity_notes_json : [];
    const researchPayload = input.marketResearch && typeof input.marketResearch.payload_json === "object" && input.marketResearch.payload_json !== null
        ? input.marketResearch.payload_json
        : null;
    const researchSummary = researchPayload?.market && typeof researchPayload.market === "object" && researchPayload.market !== null && typeof researchPayload.market.summary === "string"
        ? researchPayload.market.summary
        : null;
    const researchCompetitors = researchPayload?.competition && typeof researchPayload.competition === "object" && researchPayload.competition !== null && Array.isArray(researchPayload.competition.competitorUrls)
        ? researchPayload.competition.competitorUrls
        : [];
    return {
        client: {
            id: input.client.id,
            name: input.client.name,
            slug: input.client.slug,
            websiteUrl: input.client.website_url,
            segment: input.client.segment,
            status: input.client.status,
        },
        diagnosis: {
            archetype,
            confidence: input.snapshot?.confidence ?? 0,
            publicOnly: input.snapshot?.public_only ?? true,
            marketResearch: input.marketResearch
                ? {
                    id: input.marketResearch.id,
                    version: input.marketResearch.version,
                    status: input.marketResearch.status,
                    summary: researchSummary,
                    competitors: researchCompetitors,
                }
                : null,
            scores: {
                presence: input.snapshot?.presence_score ?? null,
                consistency: input.snapshot?.consistency_score ?? null,
                proof: input.snapshot?.proof_score ?? null,
                conversionReadiness: input.snapshot?.conversion_readiness ?? null,
            },
            mainGaps: gaps,
            opportunityNotes: opportunities,
            rawNotes: input.snapshot?.raw_notes ?? null,
        },
        narrative: {
            summary: archetype === "escala"
                ? "The brand has enough base to scale with a stronger publishing system and conversion flow."
                : archetype === "conversao"
                    ? "The brand needs a tighter content-to-lead bridge and clearer calls to action."
                    : archetype === "autoridade"
                        ? "The brand needs stronger proof and a more consistent expert narrative."
                        : "The brand needs a clearer public presence before deeper conversion work.",
            recommendedPositioning: archetype === "escala"
                ? "Scale the existing momentum"
                : archetype === "conversao"
                    ? "Turn attention into lead flow"
                    : archetype === "autoridade"
                        ? "Build trust and expert authority"
                        : "Establish a visible presence",
        },
        offerRecommendation: {
            mode: archetype,
            focus: archetype === "escala"
                ? "Multi-channel content cadence and conversion sequencing"
                : archetype === "conversao"
                    ? "Lead generation and CTA clarity"
                    : archetype === "autoridade"
                        ? "Proof, case studies and expert narrative"
                        : "Consistency, profile hygiene and publishing rhythm",
        },
    };
};
export const getBrief = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestBrief = await findLatestBriefByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    return {
        client,
        latestBrief,
        snapshot,
        marketResearch,
        profiles,
    };
};
export const createBrief = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    const payload = buildBriefPayload({
        client,
        snapshot,
        marketResearch,
        profilesCount: profiles.length,
    });
    const brief = await createBriefVersion({
        clientId: input.clientId,
        status: input.status,
        payload: {
            ...payload,
            note: input.note ?? null,
            createdFrom: "social-intelligence",
        },
    });
    const briefs = await listBriefsByClientId(input.clientId);
    return {
        client,
        brief,
        briefs,
        payload,
    };
};
export const reviseBrief = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestBrief = await findLatestBriefByClientId(input.clientId);
    if (!latestBrief || typeof latestBrief.payload_json !== "object" || latestBrief.payload_json === null) {
        throw createError("FAILED_PRECONDITION", "Brief is required before revision", 422);
    }
    const payload = latestBrief.payload_json;
    const nextPayload = {
        ...payload,
        note: input.note ?? payload.note ?? null,
        revisedFromBriefVersion: latestBrief.version,
        createdFrom: "manual-edit",
    };
    const narrative = payload.narrative && typeof payload.narrative === "object" ? payload.narrative : {};
    nextPayload.narrative = {
        ...narrative,
        summary: input.summaryOverride ?? narrative.summary ?? "Brief revised.",
    };
    const brief = await updateBriefVersion({
        clientId: input.clientId,
        status: input.status,
        payload: nextPayload,
    });
    const briefs = await listBriefsByClientId(input.clientId);
    return {
        client,
        brief,
        briefs,
        payload: nextPayload,
    };
};
