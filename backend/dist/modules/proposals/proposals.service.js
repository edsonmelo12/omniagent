import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { assertCampaignStage } from "../campaign/campaign.service.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findLatestBrandProfileByClientId } from "../brand-profile/brand-profile.repository.js";
import { findPrimaryProductByClientId } from "../client-products/client-products.repository.js";
import { findLatestOfferProfileByProductId } from "../offer-profile/offer-profile.repository.js";
import { getOfferProfileSignals } from "../offer-profile/offer-profile.service.js";
import { findLatestCreativeProfileByClientId } from "../creative-profile/creative-profile.repository.js";
import { getCreativeProfileSignals } from "../creative-profile/creative-profile.service.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { createProposalVersion, listProposalsByClientId, updateProposalVersion } from "./proposals.repository.js";
const chooseArchetype = (snapshot, profileCount, marketResearch) => {
    if (!snapshot) {
        return "presenca";
    }
    const payload = marketResearch && typeof marketResearch.payload_json === "object" && marketResearch.payload_json !== null ? marketResearch.payload_json : null;
    const marketStage = payload?.market && typeof payload.market === "object" && payload.market !== null && typeof payload.market.stage === "string"
        ? String(payload.market.stage)
        : null;
    const presence = snapshot.presence_score ?? 0;
    const consistency = snapshot.consistency_score ?? 0;
    const proof = snapshot.proof_score ?? 0;
    const conversion = snapshot.conversion_readiness ?? 0;
    if (marketStage === "scale") {
        return "escala";
    }
    if (marketStage === "conversion") {
        return "conversao";
    }
    if (marketStage === "authority") {
        return "autoridade";
    }
    if (profileCount >= 4 && presence >= 80 && consistency >= 75 && proof >= 65 && conversion >= 70) {
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
const buildPresentationObjective = (archetype) => {
    switch (archetype) {
        case "escala":
            return "Escalar a base atual com narrativa repetível, prova e conversão";
        case "conversao":
            return "Transformar atenção em demanda comercial com CTA e narrativa clara";
        case "autoridade":
            return "Converter operação em autoridade pública recorrente";
        default:
            return "Construir presença pública e prova mínima para abrir a conversa";
    }
};
const buildSlides = (input) => [
    {
        title: "Capa e Objetivo",
        content: `${input.clientName} | Proposta de Social Growth\nObjetivo: ${input.objective}\nTese: ${input.thesis}\nArquétipo: ${input.archetype}`,
    },
    {
        title: "Diagnostico",
        content: input.snapshotSummary,
    },
    {
        title: "Oportunidade",
        content: input.clientRecordSummary,
    },
    {
        title: "Mercado e Concorrencia",
        content: input.marketResearchSummary,
    },
    {
        title: "Tese",
        content: input.thesis,
    },
    {
        title: "Arquitetura da Solucao",
        content: input.archetype === "escala"
            ? "Cadencia multicanal, prova e conversao em escala."
            : input.archetype === "conversao"
                ? "Conteudo, CTA e funil leve para transformar atencao em lead."
                : input.archetype === "autoridade"
                    ? "Narrativa, prova e autoridade para aumentar confianca."
                    : "Presenca consistente e posicionamento basico para sair do zero.",
    },
    {
        title: "Plano de Acao",
        content: "Inteligencia social, registro do cliente, conteudo e monitoramento em ciclo continuo.",
    },
    {
        title: "Proximo Passo",
        content: "Aprovar a direcao e iniciar o primeiro ciclo operacional.",
    },
];
const summarizeSnapshot = (snapshot) => {
    const gaps = Array.isArray(snapshot.main_gaps_json)
        ? snapshot.main_gaps_json
            .map((gap) => {
            if (gap === "presence")
                return "presenca";
            if (gap === "consistency")
                return "consistencia";
            if (gap === "proof")
                return "prova";
            if (gap === "conversion")
                return "conversao";
            return String(gap);
        })
            .join(", ")
        : "nenhuma";
    const presence = snapshot.presence_score ?? 0;
    const consistency = snapshot.consistency_score ?? 0;
    const proof = snapshot.proof_score ?? 0;
    const conversion = snapshot.conversion_readiness ?? 0;
    const maturity = Math.round((presence + consistency + proof + conversion) / 4);
    const readinessBand = maturity >= 80 ? "forte" : maturity >= 60 ? "boa" : maturity >= 40 ? "base" : "inicial";
    return `Presenca ${presence}/100, consistencia ${consistency}/100, prova ${proof}/100, prontidao de conversao ${conversion}/100, maturidade ${maturity}/100 (${readinessBand}). Principais lacunas: ${gaps}.`;
};
const summarizeClientRecord = (clientRecord) => {
    if (!clientRecord || typeof clientRecord.payload_json !== "object" || clientRecord.payload_json === null) {
        return "Registro do cliente ainda nao foi criado.";
    }
    const payload = clientRecord.payload_json;
    return payload.narrative?.summary ?? "Registro do cliente pronto.";
};
const summarizeMarketResearch = (marketResearch) => {
    if (!marketResearch || typeof marketResearch.payload_json !== "object" || marketResearch.payload_json === null) {
        return "Mercado e concorrencia ainda nao foram consolidados.";
    }
    const payload = marketResearch.payload_json;
    const market = payload.market && typeof payload.market === "object" && payload.market !== null ? payload.market : {};
    const competition = payload.competition && typeof payload.competition === "object" && payload.competition !== null ? payload.competition : {};
    const summary = typeof market.summary === "string" ? market.summary : "Mercado analisado.";
    const positioning = typeof market.positioning === "string" ? market.positioning : "Posicionamento em definicao.";
    const benchmark = typeof competition.benchmarkSummary === "string" ? competition.benchmarkSummary : "Concorrencia mapeada.";
    return `${summary} ${positioning}. ${benchmark}`;
};
export const buildProposalCommercialBrief = (input) => {
    const clientRecordPayload = input.clientRecord && typeof input.clientRecord.payload_json === "object" && input.clientRecord.payload_json !== null
        ? input.clientRecord.payload_json
        : null;
    const marketResearchPayload = input.marketResearch && typeof input.marketResearch.payload_json === "object" && input.marketResearch.payload_json !== null
        ? input.marketResearch.payload_json
        : null;
    const narrative = clientRecordPayload?.narrative && typeof clientRecordPayload.narrative === "object" ? clientRecordPayload.narrative : null;
    const diagnosis = clientRecordPayload?.diagnosis && typeof clientRecordPayload.diagnosis === "object" ? clientRecordPayload.diagnosis : null;
    const market = marketResearchPayload?.market && typeof marketResearchPayload.market === "object" ? marketResearchPayload.market : null;
    const targetAudience = input.creativeProfile?.targetAudience ??
        (typeof narrative?.audience === "string" ? narrative.audience : null) ??
        input.offerProfile?.audience ??
        input.client.segment ??
        null;
    const buyerPersonas = input.creativeProfile?.buyerPersonas ?? (targetAudience ? [targetAudience] : []);
    const uniqueValueProposition = input.creativeProfile?.uniqueValueProposition ??
        (typeof narrative?.recommendedPositioning === "string" ? narrative.recommendedPositioning : null) ??
        input.offerProfile?.summary ??
        (typeof market?.positioning === "string" ? market.positioning : null) ??
        null;
    const brandArchetype = input.creativeProfile?.brandArchetype ?? (typeof diagnosis?.archetype === "string" ? diagnosis.archetype : null) ?? "trusted specialist";
    const objectionsToAddress = input.creativeProfile?.proofPoints?.length && input.creativeProfile.proofPoints.length > 0
        ? input.creativeProfile.proofPoints
        : Array.isArray(diagnosis?.objections)
            ? diagnosis.objections.map((value) => String(value))
            : [];
    const proofAssets = input.creativeProfile?.proofPoints ?? input.offerProfile?.proofPoints ?? [];
    const ctaRecommendation = input.creativeProfile?.ctaStyle ?? input.offerProfile?.primaryCta ?? "Solicitar conversa";
    const visualDirection = input.creativeProfile?.visualIdentity ?? input.creativeProfile?.layoutFamily ?? "clean proof-led";
    const logoTreatment = input.creativeProfile?.logoTreatment ?? (input.brandProfile?.id ? "logo confirmado" : "logo pendente");
    const productImageryDirection = input.creativeProfile?.productImageryDirection ?? input.creativeProfile?.imageRecommendation ?? "clean product imagery";
    const proposalAngle = input.creativeProfile?.proposalAngle ?? "proposta orientada a clareza de oferta e próximo passo";
    const confidence = Math.round([
        input.creativeProfile?.confidence ?? 50,
        input.offerProfile?.confidence ?? 50,
        input.brandProfile?.confidence ?? 50,
        input.snapshot?.proof_score ?? 50,
    ].reduce((sum, value) => sum + value, 0) / 4);
    return {
        summary: `${input.client.name} fala com ${targetAudience ?? "público prioritário"} a partir de uma UVP de ${uniqueValueProposition ?? "clareza comercial"}.`,
        targetAudience,
        buyerPersonas,
        uniqueValueProposition,
        brandArchetype,
        objectionsToAddress,
        proofAssets,
        ctaRecommendation,
        visualDirection,
        logoTreatment,
        productImageryDirection,
        proposalAngle,
        confidence,
        sources: {
            creativeProfileId: input.creativeProfile?.id ?? null,
            offerProfileId: input.offerProfile?.productId ?? null,
            brandProfileId: input.brandProfile?.id ?? null,
            primaryProductId: input.primaryProduct?.id ?? null,
        },
        marketStage: typeof market?.stage === "string" ? market.stage : null,
        conversionReadiness: input.snapshot?.conversion_readiness ?? null,
        notes: [
            ...(input.creativeProfile ? ["creative profile available"] : ["creative profile missing"]),
            ...(input.offerProfile ? ["offer profile available"] : ["offer profile missing"]),
            ...(input.brandProfile ? ["brand profile available"] : ["brand profile missing"]),
        ],
    };
};
export const getProposalContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const creativeProfileRow = await findLatestCreativeProfileByClientId(input.clientId);
    const creativeProfile = getCreativeProfileSignals(creativeProfileRow);
    const brandProfile = await findLatestBrandProfileByClientId(input.clientId);
    const primaryProduct = await findPrimaryProductByClientId(input.clientId);
    const offerProfileRow = primaryProduct ? await findLatestOfferProfileByProductId(primaryProduct.id) : null;
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    const proposalBrief = buildProposalCommercialBrief({
        client,
        clientRecord,
        marketResearch,
        snapshot,
        creativeProfile,
        offerProfile,
        brandProfile,
        primaryProduct,
    });
    const proposals = await listProposalsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        snapshot,
        marketResearch,
        creativeProfile,
        brandProfile,
        primaryProduct,
        offerProfile,
        proposalBrief,
        proposals,
    };
};
export const createProposal = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        allowedStages: ["research", "strategy"],
    });
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    const creativeProfileRow = await findLatestCreativeProfileByClientId(input.clientId);
    const creativeProfile = getCreativeProfileSignals(creativeProfileRow);
    const brandProfile = await findLatestBrandProfileByClientId(input.clientId);
    const primaryProduct = await findPrimaryProductByClientId(input.clientId);
    const offerProfileRow = primaryProduct ? await findLatestOfferProfileByProductId(primaryProduct.id) : null;
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    if (!clientRecord || !snapshot) {
        throw createError("FAILED_PRECONDITION", "Client record and social intelligence are required before proposal generation", 422);
    }
    const profilesCount = profiles.length;
    const archetype = chooseArchetype(snapshot, profilesCount, marketResearch);
    const thesis = archetype === "escala"
        ? "Escalar a base social atual com um motor de conteudo repetivel e um fluxo de conversao mais forte."
        : archetype === "conversao"
            ? "Transformar atencao em fluxo de leads alinhando conteudo, CTA e narrativa comercial."
            : archetype === "autoridade"
                ? "Construir confianca por meio de prova, consistencia e posicionamento especializado."
                : "Criar uma presenca publica confiavel antes de aprofundar o trabalho de conversao.";
    const objective = buildPresentationObjective(archetype);
    const proposalBrief = buildProposalCommercialBrief({
        client,
        clientRecord,
        marketResearch,
        snapshot,
        creativeProfile,
        offerProfile,
        brandProfile,
        primaryProduct,
    });
    const proposalPayload = {
        archetype,
        thesis,
        objective,
        proposalBrief,
        presentationHeader: {
            title: `${client.name} | Proposta de Social Growth`,
            objective,
            thesis,
            archetype,
        },
        clientRecordVersion: clientRecord.version,
        snapshotId: snapshot.id,
        marketResearchId: marketResearch?.id ?? null,
        creativeProfileId: creativeProfile?.id ?? null,
        slides: buildSlides({
            archetype,
            thesis,
            objective,
            clientName: client.name,
            clientRecordSummary: summarizeClientRecord(clientRecord),
            snapshotSummary: summarizeSnapshot(snapshot),
            marketResearchSummary: summarizeMarketResearch(marketResearch),
        }),
        source: {
            clientRecordId: clientRecord.id,
            snapshotId: snapshot.id,
            marketResearchId: marketResearch?.id ?? null,
            creativeProfileId: creativeProfile?.id ?? null,
            brandProfileId: brandProfile?.id ?? null,
            primaryProductId: primaryProduct?.id ?? null,
        },
        marketResearch: marketResearch
            ? {
                id: marketResearch.id,
                version: marketResearch.version,
                summary: summarizeMarketResearch(marketResearch),
            }
            : null,
        creativeProfile: creativeProfile ? { id: creativeProfile.id, version: creativeProfile.version } : null,
        brandProfile: brandProfile ? { id: brandProfile.id, version: brandProfile.version } : null,
        product: primaryProduct
            ? {
                id: primaryProduct.id,
                name: primaryProduct.name,
                category: primaryProduct.category,
                offerType: primaryProduct.offer_type,
                audience: primaryProduct.audience,
                promise: primaryProduct.promise,
            }
            : null,
    };
    const proposal = await createProposalVersion({
        clientId: input.clientId,
        archetype,
        thesis,
        status: input.status,
        payload: proposalPayload,
    });
    const proposalVersions = await listProposalsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        snapshot,
        marketResearch,
        creativeProfile,
        brandProfile,
        primaryProduct,
        offerProfile,
        proposal,
        proposals: proposalVersions,
        payload: proposalPayload,
    };
};
export const reviseProposal = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        allowedStages: ["research", "strategy"],
    });
    const clientRecord = await findLatestClientRecordByClientId(input.clientId);
    const snapshot = await listLatestSnapshotByClientId(input.clientId);
    const marketResearch = await findLatestMarketResearchByClientId(input.clientId);
    const profiles = await listSocialProfilesByClientId(input.clientId);
    const creativeProfileRow = await findLatestCreativeProfileByClientId(input.clientId);
    const creativeProfile = getCreativeProfileSignals(creativeProfileRow);
    const brandProfile = await findLatestBrandProfileByClientId(input.clientId);
    const primaryProduct = await findPrimaryProductByClientId(input.clientId);
    const offerProfileRow = primaryProduct ? await findLatestOfferProfileByProductId(primaryProduct.id) : null;
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    if (!clientRecord || !snapshot) {
        throw createError("FAILED_PRECONDITION", "Client record and social intelligence are required before proposal revision", 422);
    }
    const profilesCount = profiles.length;
    const archetype = chooseArchetype(snapshot, profilesCount, marketResearch);
    const latestProposal = await listProposalsByClientId(input.clientId);
    const currentThesis = input.thesisOverride ?? latestProposal[0]?.thesis ?? (archetype === "escala"
        ? "Escalar a base social atual com um motor de conteudo repetivel e um fluxo de conversao mais forte."
        : archetype === "conversao"
            ? "Transformar atencao em fluxo de leads alinhando conteudo, CTA e narrativa comercial."
            : archetype === "autoridade"
                ? "Construir confianca por meio de prova, consistencia e posicionamento especializado."
                : "Criar uma presenca publica confiavel antes de aprofundar o trabalho de conversao.");
    const objective = buildPresentationObjective(archetype);
    const proposalBrief = buildProposalCommercialBrief({
        client,
        clientRecord,
        marketResearch,
        snapshot,
        creativeProfile,
        offerProfile,
        brandProfile,
        primaryProduct,
    });
    const proposalPayload = {
        archetype,
        thesis: currentThesis,
        objective,
        proposalBrief,
        presentationHeader: {
            title: `${client.name} | Proposta de Social Growth`,
            objective,
            thesis: currentThesis,
            archetype,
        },
        clientRecordVersion: clientRecord.version,
        snapshotId: snapshot.id,
        marketResearchId: marketResearch?.id ?? null,
        creativeProfileId: creativeProfile?.id ?? null,
        revisionNote: input.note ?? null,
        slides: buildSlides({
            archetype,
            thesis: currentThesis,
            objective,
            clientName: client.name,
            clientRecordSummary: summarizeClientRecord(clientRecord),
            snapshotSummary: summarizeSnapshot(snapshot),
            marketResearchSummary: summarizeMarketResearch(marketResearch),
        }),
        source: {
            clientRecordId: clientRecord.id,
            snapshotId: snapshot.id,
            marketResearchId: marketResearch?.id ?? null,
            creativeProfileId: creativeProfile?.id ?? null,
            brandProfileId: brandProfile?.id ?? null,
            primaryProductId: primaryProduct?.id ?? null,
        },
        marketResearch: marketResearch
            ? {
                id: marketResearch.id,
                version: marketResearch.version,
                summary: summarizeMarketResearch(marketResearch),
            }
            : null,
        creativeProfile: creativeProfile ? { id: creativeProfile.id, version: creativeProfile.version } : null,
        brandProfile: brandProfile ? { id: brandProfile.id, version: brandProfile.version } : null,
        product: primaryProduct
            ? {
                id: primaryProduct.id,
                name: primaryProduct.name,
                category: primaryProduct.category,
                offerType: primaryProduct.offer_type,
                audience: primaryProduct.audience,
                promise: primaryProduct.promise,
            }
            : null,
        createdFrom: "manual-edit",
    };
    const proposal = await updateProposalVersion({
        clientId: input.clientId,
        archetype,
        thesis: currentThesis,
        status: input.status,
        payload: proposalPayload,
    });
    const proposals = await listProposalsByClientId(input.clientId);
    return {
        client,
        clientRecord,
        snapshot,
        marketResearch,
        creativeProfile,
        brandProfile,
        primaryProduct,
        offerProfile,
        proposal,
        proposals,
        payload: proposalPayload,
    };
};
