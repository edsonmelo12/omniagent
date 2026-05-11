import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findLatestBrandProfileByClientId } from "../brand-profile/brand-profile.repository.js";
import { findPrimaryProductByClientId } from "../client-products/client-products.repository.js";
import { resolveGeographicCoverage } from "../market-research/market-geography.js";
import { getMarketPresenceContext } from "../market-presence/market-presence.service.js";
import { findLatestMonitoringReportByClientId } from "../monitoring/monitoring.repository.js";
import { findLatestProposalByClientId } from "../proposals/proposals.repository.js";
import { getSocialPresenceContext } from "../social-presence/social-presence.service.js";
import { findLatestOfferProfileByProductId, listOfferProfilesByProductId } from "../offer-profile/offer-profile.repository.js";
import { getOfferProfileSignals } from "../offer-profile/offer-profile.service.js";
import { findLatestCreativeProfileByClientId, listCreativeProfilesByClientId } from "../creative-profile/creative-profile.repository.js";
import { getCreativeProfileSignals } from "../creative-profile/creative-profile.service.js";
const asRecord = (value) => (typeof value === "object" && value !== null ? value : null);
const asString = (value) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const asNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const asArray = (value) => (Array.isArray(value) ? value : []);
const formatDateOnly = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value.trim() : parsed.toISOString().slice(0, 10);
    }
    return null;
};
const getRecordString = (record, path) => {
    let current = record;
    for (const key of path) {
        const next = asRecord(current);
        if (!next)
            return null;
        current = next[key];
    }
    return asString(current);
};
const getRecordArray = (record, path) => {
    let current = record;
    for (const key of path) {
        const next = asRecord(current);
        if (!next)
            return [];
        current = next[key];
    }
    return asArray(current);
};
const buildWeights = (marketPayload) => {
    const weights = asRecord(marketPayload?.market)?.weights;
    const weightRecord = asRecord(weights);
    return {
        client: asNumber(weightRecord?.client) ?? 35,
        market: asNumber(weightRecord?.market) ?? 35,
        competition: asNumber(weightRecord?.competition) ?? 30,
    };
};
const extractBrandSnapshot = (brandProfileRow) => {
    if (!brandProfileRow) {
        return null;
    }
    const confirmed = asRecord(brandProfileRow.confirmed_json);
    const inferred = asRecord(brandProfileRow.inferred_json);
    const visualPalette = asArray(confirmed?.visualPalette ?? inferred?.visualPalette)
        .map((value) => asString(value))
        .filter((value) => Boolean(value));
    const socialProfiles = asArray(confirmed?.socialProfiles)
        .map((value) => asRecord(value))
        .filter((value) => Boolean(value))
        .map((value) => ({
        platform: asString(value.platform) ?? "rede social",
        handle: asString(value.handle),
        profileUrl: asString(value.profileUrl) ?? asString(value.url),
        status: asString(value.status),
        confidence: asNumber(value.confidence),
    }));
    return {
        brandName: asString(confirmed?.brandName) ?? asString(confirmed?.name) ?? null,
        website: asString(confirmed?.website) ?? null,
        websiteTitle: asString(confirmed?.websiteTitle) ?? null,
        websiteDescription: asString(confirmed?.websiteDescription) ?? null,
        logoUrl: asString(confirmed?.logoUrl) ?? null,
        contactEmail: asString(confirmed?.contactEmail) ?? null,
        visualPalette,
        socialProfiles,
        summary: asString(brandProfileRow.confirmed_json?.summary) ?? asString(brandProfileRow.inferred_json?.summary) ?? null,
    };
};
const extractOfferSnapshot = (offerProfile, primaryProduct) => {
    if (!offerProfile) {
        return null;
    }
    return {
        productId: offerProfile.productId ?? primaryProduct?.id ?? null,
        productName: offerProfile.productName ?? primaryProduct?.name ?? null,
        category: offerProfile.category ?? primaryProduct?.category ?? null,
        offerType: offerProfile.offerType ?? primaryProduct?.offer_type ?? null,
        priceLabel: offerProfile.priceLabel ?? primaryProduct?.price_label ?? null,
        audience: offerProfile.audience ?? primaryProduct?.audience ?? null,
        promise: offerProfile.promise ?? primaryProduct?.promise ?? null,
        problemSolved: offerProfile.problemSolved ?? primaryProduct?.problem_solved ?? null,
        landingUrl: offerProfile.landingUrl ?? primaryProduct?.landing_url ?? null,
        primaryCta: offerProfile.primaryCta,
        toneOfVoice: offerProfile.toneOfVoice,
        proofPoints: offerProfile.proofPoints,
        proofGaps: offerProfile.proofGaps,
        summary: offerProfile.summary,
    };
};
const extractClientBriefSnapshot = (clientRecordRow, client) => {
    if (!clientRecordRow) {
        return null;
    }
    const payload = asRecord(clientRecordRow.payload_json);
    const clientPayload = asRecord(payload?.client);
    const contactPayload = asRecord(payload?.contact);
    const visualIdentityPayload = asRecord(payload?.visualIdentity);
    const productsPolicyPayload = asRecord(payload?.productsPolicy);
    return {
        summary: getRecordString(payload, ["narrative", "summary"]) ?? getRecordString(payload, ["summary"]) ?? null,
        recommendedPositioning: getRecordString(payload, ["narrative", "recommendedPositioning"]) ?? getRecordString(payload, ["offerRecommendation", "focus"]) ?? null,
        archetype: getRecordString(payload, ["diagnosis", "archetype"]) ?? null,
        note: asString(payload?.note),
        websiteUrl: asString(clientPayload?.websiteUrl) ?? client.website_url,
        segment: asString(clientPayload?.segment) ?? client.segment,
        status: asString(clientPayload?.status) ?? client.status,
        contactEmail: asString(contactPayload?.email) ?? null,
        visualPalette: asArray(visualIdentityPayload?.palette)
            .map((value) => asString(value))
            .filter((value) => Boolean(value)),
        productsByDemand: typeof productsPolicyPayload?.productsByDemand === "boolean" ? productsPolicyPayload.productsByDemand : null,
    };
};
const extractSocialProfileSnapshots = (profiles) => profiles.map((profile) => ({
    platform: profile.platform,
    handle: profile.handle,
    profileUrl: profile.profile_url,
    status: profile.status,
    confidence: profile.confidence,
}));
export const extractPublicSignals = (marketResearchPayload) => {
    const publicSignalsPayload = asRecord(marketResearchPayload?.publicSignals);
    return {
        summary: asString(publicSignalsPayload?.summary) ?? getRecordString(marketResearchPayload, ["note"]) ?? null,
        queryCount: asNumber(publicSignalsPayload?.queryCount) ?? 0,
        sourceCount: asNumber(publicSignalsPayload?.sourceCount) ?? 0,
    };
};
const calculateMaturity = (presence, consistency, proof, conversion) => {
    if ([presence, consistency, proof, conversion].some((value) => value === null)) {
        return null;
    }
    return Math.round(((presence ?? 0) + (consistency ?? 0) + (proof ?? 0) + (conversion ?? 0)) / 4);
};
const summarizeGrowthMetrics = (monitoringPayload) => {
    const growth = asRecord(monitoringPayload?.metrics)?.growth;
    const growthRecord = asRecord(growth);
    if (!growthRecord) {
        return {
            summary: "Métricas de crescimento ainda não foram alimentadas.",
            missing: ["followers", "reach", "impressions", "profileVisits", "clicks", "saves", "shares", "engagementRate"],
        };
    }
    const metrics = [
        ["seguidores", "followerDelta"],
        ["alcance", "reach"],
        ["impressões", "impressions"],
        ["visitas", "profileVisits"],
        ["cliques", "clicks"],
        ["salvamentos", "saves"],
        ["compartilhamentos", "shares"],
        ["engajamento", "engagementRate"],
    ];
    const present = [];
    const missing = [];
    for (const [label, key] of metrics) {
        const value = asNumber(growthRecord[key]);
        if (value === null) {
            missing.push(label);
        }
        else {
            present.push(`${label} ${value}`);
        }
    }
    return {
        summary: present.length > 0 ? `Métricas de crescimento registradas: ${present.join(" · ")}.` : "Métricas de crescimento ainda não foram alimentadas.",
        missing,
    };
};
export const buildClientReportPayload = (input) => {
    const clientRecordPayload = asRecord(input.clientRecord?.payload_json);
    const marketResearchPayload = asRecord(input.marketResearch?.payload_json);
    const brandProfilePayload = {
        ...(asRecord(input.brandProfile?.confirmed_json) ?? {}),
        ...(asRecord(input.brandProfile?.inferred_json) ?? {}),
        ...(asRecord(input.brandProfile?.proof_json) ?? {}),
    };
    const monitoringPayload = asRecord(input.monitoring?.payload_json);
    const proposalPayload = asRecord(input.proposal?.payload_json);
    const creativeProfiles = input.creativeProfiles ?? [];
    const geographyCoverage = resolveGeographicCoverage({
        defaultCountry: "Brasil",
        sources: [
            { label: "client.name", value: input.client.name },
            { label: "client.segment", value: input.client.segment },
            { label: "client.website_url", value: input.client.website_url },
            { label: "client.notes", value: input.client.notes },
            { label: "clientRecord.payload_json", value: clientRecordPayload },
            { label: "marketResearch.payload_json", value: marketResearchPayload },
            { label: "marketPresence.marketContext", value: input.marketPresence.latestBaseline?.market_context ?? null },
            { label: "socialPresence.summary", value: input.socialPresence.summary.summary ?? null },
            { label: "proposal.payload_json", value: proposalPayload },
        ],
    });
    const clientSummary = getRecordString(clientRecordPayload, ["narrative", "summary"]) ??
        getRecordString(clientRecordPayload, ["diagnosis", "marketResearch", "summary"]) ??
        "Sem client record consolidado.";
    const recommendedPositioning = getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ??
        getRecordString(clientRecordPayload, ["offerRecommendation", "focus"]) ??
        null;
    const marketSummary = getRecordString(marketResearchPayload, ["market", "summary"]) ??
        getRecordString(marketResearchPayload, ["market", "positioning"]) ??
        "Sem leitura de mercado consolidada.";
    const marketStage = getRecordString(marketResearchPayload, ["market", "stage"]) ??
        getRecordString(marketResearchPayload, ["market", "maturity"]) ??
        "indefinido";
    const competitionSummary = getRecordString(marketResearchPayload, ["competition", "benchmarkSummary"]) ??
        `Benchmark com ${getRecordArray(marketResearchPayload, ["competition", "competitorUrls"]).length} concorrente(s) e ${getRecordArray(marketResearchPayload, ["competition", "sourceSignals"]).length} sinais de referência.`;
    const weights = buildWeights(marketResearchPayload);
    const publicSignals = extractPublicSignals(marketResearchPayload);
    const socialPresence = input.socialPresence.summary;
    const baselineMaturity = calculateMaturity(input.marketPresence.latestBaseline?.presence_score ?? null, input.marketPresence.latestBaseline?.consistency_score ?? null, input.marketPresence.latestBaseline?.proof_score ?? null, input.marketPresence.latestBaseline?.conversion_score ?? null);
    const baselineSummary = input.marketPresence.latestBaseline
        ? `baseline ${input.marketPresence.latestBaseline.version}${baselineMaturity !== null ? ` com maturidade ${baselineMaturity}` : ""}`
        : "sem baseline";
    const checkpointDate = formatDateOnly(input.marketPresence.latestCheckpoint?.collected_at);
    const checkpointSummary = input.marketPresence.latestCheckpoint
        ? `checkpoint ${input.marketPresence.latestCheckpoint.version}${checkpointDate ? ` coletado em ${checkpointDate}` : ""}`
        : "sem checkpoint";
    const beforeAfterSummary = input.marketPresence.latestComparison
        ? `${input.marketPresence.latestComparison.reading} · ${input.marketPresence.latestComparison.analogy}`
        : `${baselineSummary} e ${checkpointSummary}`;
    const growth = summarizeGrowthMetrics(monitoringPayload);
    const monitoringInterpretations = getRecordArray(monitoringPayload, ["signals", "interpretations"])
        .map((value) => asString(value))
        .filter((value) => Boolean(value));
    const operationalSummary = monitoringInterpretations.length > 0
        ? monitoringInterpretations.join(" · ")
        : growth.summary;
    const proposalObjective = getRecordString(proposalPayload, ["presentationHeader", "objective"]) ??
        getRecordString(proposalPayload, ["objective"]) ??
        null;
    const commercialSummary = proposalObjective && input.proposal?.thesis
        ? `${proposalObjective} · ${input.proposal.thesis}`
        : asString(input.proposal?.thesis) ??
            proposalObjective ??
            getRecordString(proposalPayload, ["marketResearch", "summary"]) ??
            "Sem tese comercial consolidada.";
    const brandSummary = asString(brandProfilePayload.summary) ??
        (input.brandProfile
            ? `Brand profile v${input.brandProfile.version} com status ${input.brandProfile.status}.`
            : "Sem brand profile consolidado.");
    const brandSnapshot = extractBrandSnapshot(input.brandProfile);
    const briefSnapshot = extractClientBriefSnapshot(input.clientRecord, {
        website_url: input.client.website_url,
        segment: input.client.segment,
        status: input.client.status,
    });
    const socialProfileSnapshots = extractSocialProfileSnapshots(input.marketPresence.profiles);
    const creativeSnapshot = input.creativeProfile;
    const offerSummary = (input.offerProfile
        ? input.offerProfile.summary ?? `Oferta ${input.offerProfile.productName} v${input.offerProfile.version} com status ${input.offerProfile.status}.`
        : "Sem offer profile consolidado.");
    const offerSnapshot = extractOfferSnapshot(input.offerProfile, input.primaryProduct);
    const headline = marketStage === "scale"
        ? `Visão unificada de ${input.client.name} pronta para escala`
        : marketStage === "conversion"
            ? `Visão unificada de ${input.client.name} com foco em conversão`
            : marketStage === "authority"
                ? `Visão unificada de ${input.client.name} com foco em autoridade`
                : `Visão unificada de ${input.client.name}`;
    const creativeSummary = creativeSnapshot?.summary ??
        (creativeSnapshot
            ? [
                `Creative profile v${creativeSnapshot.version} com status ${creativeSnapshot.status}.`,
                creativeSnapshot.mood ? `Mood: ${creativeSnapshot.mood}.` : null,
                creativeSnapshot.backgroundTreatment ? `Background: ${creativeSnapshot.backgroundTreatment}.` : null,
                creativeSnapshot.overlayGuidance ? `Overlay: ${creativeSnapshot.overlayGuidance}.` : null,
            ]
                .filter((value) => Boolean(value))
                .join(" ")
            : "Sem creative profile consolidado.");
    const creativeAudience = creativeSnapshot?.targetAudience ?? creativeSnapshot?.audience ?? null;
    const creativePersonas = creativeSnapshot?.buyerPersonas ?? [];
    const creativeUVP = creativeSnapshot?.uniqueValueProposition ?? creativeSnapshot?.positioning ?? null;
    const creativeLogoUrl = creativeSnapshot?.logoUrl ?? null;
    const creativeProductImagery = creativeSnapshot?.productImageryDirection ?? creativeSnapshot?.imageRecommendation ?? null;
    return {
        headline,
        clientSummary,
        recommendedPositioning,
        marketSummary,
        marketStage,
        competitionSummary,
        beforeAfterSummary,
        commercialSummary,
        brandSummary,
        brandSnapshot,
        briefSnapshot,
        offerSummary,
        offerSnapshot,
        creativeSummary,
        creativeSnapshot,
        creativeAudience,
        creativePersonas,
        creativeUVP,
        creativeLogoUrl,
        creativeProductImagery,
        operationalSummary,
        geographyCoverage,
        weights,
        growth,
        sourceCoverage: {
            profiles: input.marketPresence.profiles.length,
            baselines: input.marketPresence.baselines.length,
            checkpoints: input.marketPresence.checkpoints.length,
            comparisons: input.marketPresence.comparisons.length,
            proposals: input.proposal ? 1 : 0,
            monitoringReports: input.monitoring ? 1 : 0,
            publicSignals: publicSignals.sourceCount,
            socialPresence: socialPresence.networks.length,
            offerProfiles: input.offerProfiles.length,
            creativeProfiles: creativeProfiles.length,
        },
        publicSignals: {
            summary: publicSignals.summary,
            queryCount: publicSignals.queryCount,
            sourceCount: publicSignals.sourceCount,
        },
        socialProfiles: socialProfileSnapshots,
        socialPresence,
        keySignals: [
            input.marketPresence.latestComparison?.reading ?? "sem comparação",
            input.marketPresence.latestComparison?.analogy ?? "sem analogia",
            input.proposal ? `proposta v${input.proposal.version}` : "sem proposta",
            input.marketResearch ? `research v${input.marketResearch.version}` : "sem research",
            publicSignals.sourceCount > 0 ? `Brave Search ${publicSignals.sourceCount} fonte(s)` : "Brave Search aguardando chave",
            socialPresence.networks.length > 0
                ? `Presença social ${socialPresence.networks.length} rede(s)`
                : "Presença social sem snapshots",
        ],
        missingMetrics: growth.missing,
        sourceIds: {
            clientRecordId: input.clientRecord?.id ?? null,
            marketResearchId: input.marketResearch?.id ?? null,
            baselineId: input.marketPresence.latestBaseline?.id ?? null,
            checkpointId: input.marketPresence.latestCheckpoint?.id ?? null,
            comparisonId: input.marketPresence.latestComparison?.id ?? null,
            proposalId: input.proposal?.id ?? null,
            monitoringId: input.monitoring?.id ?? null,
            brandProfileId: input.brandProfile?.id ?? null,
            primaryProductId: input.primaryProduct?.id ?? null,
            offerProfileId: input.offerProfile?.id ?? null,
            creativeProfileId: input.creativeProfile?.id ?? null,
        },
    };
};
export const getClientReportContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const [marketPresence, socialPresence, clientRecord, marketResearch, proposal, monitoring, brandProfile, primaryProduct, creativeProfileRow, creativeProfiles] = await Promise.all([
        getMarketPresenceContext(input),
        getSocialPresenceContext(input),
        findLatestClientRecordByClientId(input.clientId),
        findLatestMarketResearchByClientId(input.clientId),
        findLatestProposalByClientId(input.clientId),
        findLatestMonitoringReportByClientId(input.clientId),
        findLatestBrandProfileByClientId(input.clientId),
        findPrimaryProductByClientId(input.clientId),
        findLatestCreativeProfileByClientId(input.clientId),
        listCreativeProfilesByClientId(input.clientId),
    ]);
    const offerProfile = primaryProduct ? getOfferProfileSignals(await findLatestOfferProfileByProductId(primaryProduct.id)) : null;
    const offerProfiles = primaryProduct ? await listOfferProfilesByProductId(primaryProduct.id) : [];
    const creativeProfile = getCreativeProfileSignals(creativeProfileRow);
    const report = buildClientReportPayload({
        client,
        clientRecord,
        marketResearch,
        marketPresence,
        socialPresence,
        proposal,
        monitoring,
        brandProfile,
        primaryProduct,
        offerProfile,
        offerProfiles,
        creativeProfile,
        creativeProfiles,
    });
    return {
        client,
        clientRecord,
        marketResearch,
        marketPresence,
        socialPresence,
        proposal,
        monitoring,
        brandProfile,
        primaryProduct,
        offerProfile,
        offerProfiles,
        creativeProfile,
        creativeProfiles,
        report,
    };
};
