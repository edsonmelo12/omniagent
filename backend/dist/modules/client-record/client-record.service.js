import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { createClientRecordVersion, findLatestClientRecordByClientId, listClientRecordsByClientId, updateClientRecordVersion, } from "./client-record.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findPrimaryProductByClientId } from "../client-products/client-products.repository.js";
import { findLatestOfferProfileByProductId, listOfferProfilesByProductId } from "../offer-profile/offer-profile.repository.js";
import { getOfferProfileSignals } from "../offer-profile/offer-profile.service.js";
import { createCreativeProfile, getCreativeProfileContext } from "../creative-profile/creative-profile.service.js";
import { listStrategyLibraryStrategies } from "../strategy-intelligence/strategy-intelligence.repository.js";
import { buildRecommendationFromLibrary } from "../strategy-intelligence/strategy-intelligence.service.js";
import { createBrandProfile, getBrandProfileContext } from "../brand-profile/brand-profile.service.js";
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
const readString = (value) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const getOfferProfileContext = async (clientId) => {
    const primaryProduct = await findPrimaryProductByClientId(clientId);
    if (!primaryProduct) {
        return {
            primaryProduct: null,
            offerProfile: null,
            offerProfiles: [],
        };
    }
    const [offerProfileRow, offerProfiles] = await Promise.all([
        findLatestOfferProfileByProductId(primaryProduct.id),
        listOfferProfilesByProductId(primaryProduct.id),
    ]);
    return {
        primaryProduct,
        offerProfile: getOfferProfileSignals(offerProfileRow),
        offerProfiles,
    };
};
const buildStrategyRecommendationContext = (archetype, input) => {
    const researchPayload = input.marketResearch && typeof input.marketResearch.payload_json === "object" && input.marketResearch.payload_json !== null
        ? input.marketResearch.payload_json
        : null;
    const market = researchPayload?.market && typeof researchPayload.market === "object" && researchPayload.market !== null
        ? researchPayload.market
        : null;
    const competition = researchPayload?.competition && typeof researchPayload.competition === "object" && researchPayload.competition !== null
        ? researchPayload.competition
        : null;
    const recommendations = researchPayload?.recommendations && typeof researchPayload.recommendations === "object" && researchPayload.recommendations !== null
        ? researchPayload.recommendations
        : null;
    const campaignObjective = archetype === "escala"
        ? "sistematizar execução e ampliar a distribuição"
        : archetype === "conversao"
            ? "gerar leads qualificados e acelerar decisão"
            : archetype === "autoridade"
                ? "aumentar autoridade e gerar leads qualificados"
                : "construir presença pública e clareza de oferta";
    const funnelStage = archetype === "escala"
        ? "scale"
        : archetype === "conversao"
            ? "decision"
            : archetype === "autoridade"
                ? "consideration"
                : "awareness";
    const marketSummary = readString(market?.summary);
    const marketPositioning = readString(market?.positioning);
    const benchmarkSummary = readString(competition?.benchmarkSummary);
    const editorialPillars = Array.isArray(recommendations?.editorialPillars)
        ? recommendations.editorialPillars.map((item) => (typeof item === "string" ? item : "")).filter(Boolean)
        : [];
    return {
        campaignObjective,
        productContext: [input.client.segment, input.client.website_url].filter(Boolean).join(" · ") || null,
        serviceContext: [marketSummary, marketPositioning, benchmarkSummary].filter(Boolean).join(" · ") || null,
        audienceContext: editorialPillars.length > 0 ? editorialPillars.join(", ") : input.client.segment ?? input.client.name,
        clientSegment: input.client.segment,
        funnelStage,
    };
};
const buildStrategyRecommendationPayload = async (input) => {
    const library = await listStrategyLibraryStrategies();
    const context = buildStrategyRecommendationContext(input.archetype, {
        client: input.client,
        marketResearch: input.marketResearch,
    });
    const recommendation = buildRecommendationFromLibrary(library, context, null);
    return {
        library: library.map((strategy) => ({
            id: strategy.id,
            strategyKey: strategy.strategy_key,
            strategyName: strategy.strategy_name,
            strategySummary: strategy.strategy_summary,
            fitBand: strategy.fit_band,
            sourceCount: strategy.source_count,
            canonicalObjective: strategy.canonical_objective,
            canonicalFunnelStage: strategy.canonical_funnel_stage,
            fitSignals: strategy.fit_signals,
        })),
        recommendation,
    };
};
const buildClientRecordPayload = (input) => {
    const archetype = chooseArchetype(input.snapshot, input.profilesCount);
    const gaps = Array.isArray(input.snapshot?.main_gaps_json) ? input.snapshot?.main_gaps_json : [];
    const opportunities = Array.isArray(input.snapshot?.opportunity_notes_json) ? input.snapshot?.opportunity_notes_json : [];
    const researchPayload = input.marketResearch && typeof input.marketResearch.payload_json === "object" && input.marketResearch.payload_json !== null
        ? input.marketResearch.payload_json
        : null;
    const researchSummary = researchPayload?.market && typeof researchPayload.market === "object" && researchPayload.market !== null && typeof researchPayload.market.summary === "string"
        ? researchPayload.market.summary
        : null;
    const researchPositioning = researchPayload?.market && typeof researchPayload.market === "object" && researchPayload.market !== null && typeof researchPayload.market.positioning === "string"
        ? researchPayload.market.positioning
        : null;
    const researchWeights = researchPayload?.market && typeof researchPayload.market === "object" && researchPayload.market !== null && typeof researchPayload.market.weights === "object"
        ? researchPayload.market.weights
        : null;
    const researchCompetitors = researchPayload?.competition && typeof researchPayload.competition === "object" && researchPayload.competition !== null && Array.isArray(researchPayload.competition.competitorUrls)
        ? researchPayload.competition.competitorUrls
        : [];
    const researchBenchmarkSummary = researchPayload?.competition && typeof researchPayload.competition === "object" && researchPayload.competition !== null && typeof researchPayload.competition.benchmarkSummary === "string"
        ? researchPayload.competition.benchmarkSummary
        : null;
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
                    positioning: researchPositioning,
                    competitors: researchCompetitors,
                    benchmarkSummary: researchBenchmarkSummary,
                    weights: researchWeights,
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
                ? "A marca já tem base suficiente para escalar com um sistema de publicacao mais forte e um fluxo de conversao mais claro."
                : archetype === "conversao"
                    ? "A marca precisa de uma ponte mais forte entre conteudo e lead, com chamadas para acao mais claras."
                    : archetype === "autoridade"
                        ? "A marca precisa de mais prova e de uma narrativa de autoridade mais consistente."
                        : "A marca precisa de uma presenca publica mais clara antes de aprofundar o trabalho de conversao.",
            recommendedPositioning: archetype === "escala"
                ? "Escalar o momento atual"
                : archetype === "conversao"
                    ? "Transformar atencao em fluxo de leads"
                    : archetype === "autoridade"
                        ? "Construir confianca e autoridade"
                        : "Estabelecer uma presenca visivel",
        },
        offerRecommendation: {
            mode: archetype,
            focus: archetype === "escala"
                ? "Cadencia multicanal e sequenciamento de conversao"
                : archetype === "conversao"
                    ? "Geracao de leads e clareza de CTA"
                    : archetype === "autoridade"
                        ? "Prova, cases e narrativa de autoridade"
                        : "Consistencia, higiene de perfil e ritmo de publicacao",
        },
        strategyIntelligence: input.strategyIntelligence,
    };
};
export const getClientRecord = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestClientRecord = await findLatestClientRecordByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    const brandProfileContext = await getBrandProfileContext(input);
    const offerProfileContext = await getOfferProfileContext(input.clientId);
    const creativeProfileContext = await getCreativeProfileContext(input);
    return {
        client,
        latestClientRecord,
        brandProfile: brandProfileContext.brandProfile,
        latestBrandProfile: brandProfileContext.latestBrandProfile,
        brandProfiles: brandProfileContext.brandProfiles,
        creativeProfile: creativeProfileContext.creativeProfile,
        latestCreativeProfile: creativeProfileContext.latestCreativeProfile,
        creativeProfiles: creativeProfileContext.creativeProfiles,
        primaryProduct: offerProfileContext.primaryProduct,
        offerProfile: offerProfileContext.offerProfile,
        offerProfiles: offerProfileContext.offerProfiles,
        snapshot,
        marketResearch,
        profiles,
    };
};
export const createClientRecord = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    const strategyIntelligence = await buildStrategyRecommendationPayload({
        client: {
            name: client.name,
            slug: client.slug,
            website_url: client.website_url,
            segment: client.segment,
            notes: client.notes,
        },
        archetype: chooseArchetype(snapshot, profiles.length),
        marketResearch: marketResearch ? { payload_json: marketResearch.payload_json } : null,
    });
    const payload = buildClientRecordPayload({
        client,
        snapshot,
        marketResearch,
        profilesCount: profiles.length,
        strategyIntelligence,
    });
    const clientRecord = await createClientRecordVersion({
        clientId: input.clientId,
        status: input.status,
        payload: {
            ...payload,
            note: input.note ?? null,
            createdFrom: "social-intelligence",
        },
    });
    const brandProfile = await createBrandProfile({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        status: input.status,
        note: input.note,
    });
    const creativeProfile = await createCreativeProfile({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        status: input.status,
        note: input.note,
    });
    const offerProfileContext = await getOfferProfileContext(input.clientId);
    const clientRecords = await listClientRecordsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        clientRecords,
        brandProfile: brandProfile.brandProfile,
        brandProfiles: brandProfile.brandProfiles,
        creativeProfile: creativeProfile.creativeProfile,
        creativeProfiles: creativeProfile.creativeProfiles,
        primaryProduct: offerProfileContext.primaryProduct,
        offerProfile: offerProfileContext.offerProfile,
        offerProfiles: offerProfileContext.offerProfiles,
        payload,
    };
};
export const reviseClientRecord = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestClientRecord = await findLatestClientRecordByClientId(input.clientId);
    if (!latestClientRecord || typeof latestClientRecord.payload_json !== "object" || latestClientRecord.payload_json === null) {
        throw createError("FAILED_PRECONDITION", "Client record is required before revision", 422);
    }
    const payload = latestClientRecord.payload_json;
    const nextPayload = {
        ...payload,
        note: input.note ?? payload.note ?? null,
        revisedFromClientRecordVersion: latestClientRecord.version,
        createdFrom: "manual-edit",
    };
    const narrative = payload.narrative && typeof payload.narrative === "object" ? payload.narrative : {};
    nextPayload.narrative = {
        ...narrative,
        summary: input.summaryOverride ?? narrative.summary ?? "Client record revised.",
    };
    const clientRecord = await updateClientRecordVersion({
        clientId: input.clientId,
        status: input.status,
        payload: nextPayload,
    });
    const brandProfile = await createBrandProfile({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        status: input.status,
        note: input.note,
    });
    const creativeProfile = await createCreativeProfile({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        status: input.status,
        note: input.note,
    });
    const offerProfileContext = await getOfferProfileContext(input.clientId);
    const clientRecords = await listClientRecordsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        clientRecords,
        brandProfile: brandProfile.brandProfile,
        brandProfiles: brandProfile.brandProfiles,
        creativeProfile: creativeProfile.creativeProfile,
        creativeProfiles: creativeProfile.creativeProfiles,
        primaryProduct: offerProfileContext.primaryProduct,
        offerProfile: offerProfileContext.offerProfile,
        offerProfiles: offerProfileContext.offerProfiles,
        payload: nextPayload,
    };
};
