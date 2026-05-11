import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { findLatestBrandProfileByClientId } from "../brand-profile/brand-profile.repository.js";
import { findPrimaryProductByClientId } from "../client-products/client-products.repository.js";
import { findLatestOfferProfileByProductId, listOfferProfilesByProductId, } from "../offer-profile/offer-profile.repository.js";
import { getOfferProfileSignals } from "../offer-profile/offer-profile.service.js";
import { createCreativeProfileSources, createCreativeProfileVersion, findLatestCreativeProfileByClientId, listCreativeProfilesByClientId, updateCreativeProfileVersion, } from "./creative-profile.repository.js";
const asRecord = (value) => (typeof value === "object" && value !== null ? value : null);
const asString = (value) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const asNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);
const asArray = (value) => (Array.isArray(value) ? value : []);
const asStringArray = (value) => asArray(value)
    .map((item) => asString(item))
    .filter((item) => Boolean(item));
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
    return asStringArray(current);
};
const lowerTokens = (value) => (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
const chooseStatusLabel = (confidence, evidenceCount) => {
    if (confidence >= 80)
        return "confirmed";
    if (confidence >= 55 || evidenceCount >= 3)
        return "partial";
    return "needs confirmation";
};
const inferVisualIdentity = (input) => {
    const source = [input.brandVisualStyle, input.marketVisualStyle, input.tone, input.segment].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "luxury", "executive", "corporate", "sophisticated"].includes(token))) {
        return "dark premium with restrained contrast and high-value framing";
    }
    if (tokens.some((token) => ["didactic", "educational", "tutorial", "practical", "guide"].includes(token))) {
        return "editorial magazine with clean hierarchy and generous spacing";
    }
    if (tokens.some((token) => ["tech", "saas", "software", "digital"].includes(token))) {
        return "minimalist texture with structured blocks and proof-led accents";
    }
    return "clean, proof-led and mobile-first";
};
const inferTypographyDirection = (input) => {
    const source = [input.tone, input.visualStyle, input.segment].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "sophisticated", "luxury", "authority"].includes(token))) {
        return "serif headline with neutral sans body and tight tracking on titles";
    }
    if (tokens.some((token) => ["didactic", "educational", "guide", "tutorial"].includes(token))) {
        return "bold sans headline with readable sans body and strong numeric emphasis";
    }
    if (tokens.some((token) => ["direct", "practical", "business", "consultative"].includes(token))) {
        return "geometric sans with compact hierarchy and high-contrast callouts";
    }
    return "legible sans pair with a headline-forward hierarchy";
};
const inferLayoutFamily = (input) => {
    const source = [input.marketStage, input.offerType, input.visualStyle].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["authority", "consideration"].includes(token))) {
        return "editorial";
    }
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "split-panel";
    }
    if (tokens.some((token) => ["scale", "distribution", "system"].includes(token))) {
        return "bento";
    }
    return "poster";
};
const inferImageRiskLevel = (input) => {
    const proof = input.proofScore ?? 0;
    const confidence = Math.round((input.brandConfidence + input.offerConfidence) / 2);
    if (proof >= 70 && confidence >= 70)
        return "low";
    if (proof >= 45 || confidence >= 50)
        return "medium";
    return "high";
};
const inferPrimaryGoal = (input) => {
    const presence = input.presence ?? 0;
    const proof = input.proof ?? 0;
    const conversion = input.conversion ?? 0;
    const consistency = input.consistency ?? 0;
    if (conversion >= 65) {
        return "converter atenção em conversas qualificadas";
    }
    if (proof >= 60 || consistency >= 70) {
        return "construir autoridade visual e prova";
    }
    if (presence < 50) {
        return "aumentar presença e reconhecimento";
    }
    return "clarear oferta e elevar a qualidade visual";
};
const inferMood = (input) => {
    const source = [input.brandVisualStyle, input.tone, input.segment, input.marketStage].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "luxury", "executive", "corporate", "sophisticated"].includes(token))) {
        return "restrained, premium and confident";
    }
    if (tokens.some((token) => ["didactic", "educational", "guide", "tutorial", "practical"].includes(token))) {
        return "clear, helpful and editorial";
    }
    if (tokens.some((token) => ["craft", "artesanal", "decor", "creative", "decorative"].includes(token))) {
        return "warm, tactile and expressive";
    }
    return "clear, balanced and mobile-first";
};
const inferBrandFeel = (input) => {
    const source = [input.brandVisualStyle, input.tone, input.segment, input.marketStage].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "luxury", "executive", "corporate"].includes(token))) {
        return "premium, executive and controlled";
    }
    if (tokens.some((token) => ["craft", "artesanal", "decor", "creative", "decorative"].includes(token))) {
        return "warm, decorative and human";
    }
    if (tokens.some((token) => ["didactic", "educational", "guide", "tutorial", "practical"].includes(token))) {
        return "editorial, direct and useful";
    }
    return "credible, clean and versatile";
};
const inferBackgroundTreatment = (input) => {
    const source = [input.mood, input.visualIdentity].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "executive", "restrained"].includes(token))) {
        return "full-bleed background with dark gradient and generous negative space";
    }
    if (tokens.some((token) => ["warm", "decorative", "tactile"].includes(token))) {
        return "supportive image background with subtle dark overlay and preserved texture";
    }
    if (tokens.some((token) => ["editorial", "clean", "clear"].includes(token))) {
        return "editorial background with light texture and soft contrast control";
    }
    return input.imageRiskLevel === "high" || (input.proofScore ?? 0) < 50
        ? "image-led background with a controlled dark overlay for readability"
        : "clean image background with light contrast tuning";
};
const inferOverlayGuidance = (input) => {
    const source = [input.mood, input.visualIdentity].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (input.imageRiskLevel === "high") {
        return "use a medium-to-strong dark overlay so text stays readable on mobile";
    }
    if (tokens.some((token) => ["premium", "executive", "restrained"].includes(token))) {
        return "use a light-to-medium dark overlay to preserve the premium feel";
    }
    if (tokens.some((token) => ["warm", "decorative", "tactile"].includes(token))) {
        return "use a subtle dark overlay that keeps the ambient image visible";
    }
    return "use a light overlay tuned for contrast, not for hiding the image";
};
const inferImageStory = (input) => {
    const source = [input.mood, input.visualIdentity].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "executive", "restrained"].includes(token))) {
        return `Suggest an executive context for ${input.targetAudience} with a clean, premium environment.`;
    }
    if (tokens.some((token) => ["warm", "decorative", "tactile"].includes(token))) {
        return `Suggest a lived-in, expressive context for ${input.targetAudience} that feels close to the offer.`;
    }
    if (tokens.some((token) => ["editorial", "clean", "clear"].includes(token))) {
        return `Suggest a clear editorial context for ${input.targetAudience} that supports the message without competing with it.`;
    }
    return `Suggest a realistic context for ${input.targetAudience} that reinforces ${input.offerSummary ?? "the main offer"}.`;
};
const inferImageRecommendation = (input) => {
    const source = [input.marketStage, input.offerType, input.segment].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "Use proof-first covers, before/after structures and direct CTA framing.";
    }
    if ((input.proofScore ?? 0) >= 60) {
        return "Use editorial proof boards, case fragments and data callouts.";
    }
    if (tokens.some((token) => ["premium", "corporate", "executive"].includes(token))) {
        return "Use premium compositions with negative space and restrained accents.";
    }
    return "Use a clean, legible composition with a single focal point and clear hierarchy.";
};
const inferTargetAudience = (input) => {
    if (input.audience) {
        return input.audience;
    }
    if (input.segment) {
        return input.segment;
    }
    const source = [input.marketStage, input.offerType].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "tomadores de decisão prontos para conversão";
    }
    return "público prioritário ainda em validação";
};
const inferBuyerPersonas = (input) => {
    const personas = new Set();
    const source = [input.audience, input.segment, input.marketStage, input.offerType].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["founder", "owner", "ceo", "diretor", "socio", "sócio"].includes(token))) {
        personas.add("fundador ou sócio");
    }
    if (tokens.some((token) => ["marketing", "growth", "media", "mídia", "conteudo", "conteúdo"].includes(token))) {
        personas.add("gestor de marketing ou growth");
    }
    if (tokens.some((token) => ["health", "clinic", "clinica", "clinicas", "clínica", "clínicas", "dent", "medical", "médica", "médicas"].includes(token))) {
        personas.add("proprietário de clínica ou operação de saúde");
    }
    if (tokens.some((token) => ["ecommerce", "e-commerce", "loja", "retail", "varejo"].includes(token))) {
        personas.add("gestor de e-commerce ou varejo");
    }
    if (tokens.some((token) => ["consult", "service", "servico", "serviço", "agency", "agência"].includes(token))) {
        personas.add("decisor de compra de serviço");
    }
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        personas.add("decisor em fase de compra");
    }
    if (personas.size === 0) {
        personas.add(input.audience ?? input.segment ?? "público principal");
    }
    return [...personas];
};
const inferUniqueValueProposition = (input) => {
    if (input.positioning) {
        return input.positioning;
    }
    if (input.offerSummary) {
        return input.offerSummary;
    }
    const source = [input.marketStage].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "transformar atenção em conversas qualificadas";
    }
    if (tokens.some((token) => ["authority", "brand", "awareness"].includes(token))) {
        return "construir autoridade e reconhecimento";
    }
    return "clarear a oferta e a proposta de valor";
};
const inferBrandArchetype = (input) => {
    const source = [input.tone, input.segment, input.marketStage].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["premium", "luxury", "executive", "sophisticated"].includes(token))) {
        return "premium advisor";
    }
    if (tokens.some((token) => ["educational", "didactic", "guide", "tutorial", "teach", "trein"].includes(token))) {
        return "educator";
    }
    if (tokens.some((token) => ["conversion", "lead", "sale", "performance"].includes(token))) {
        return "performance partner";
    }
    if (tokens.some((token) => ["community", "creator", "audience"].includes(token))) {
        return "community builder";
    }
    return "trusted specialist";
};
const inferProductImageryDirection = (input) => {
    const source = [input.marketStage, input.offerType, input.segment].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "proof-first product imagery with cases, before/after structures and explicit CTA framing";
    }
    if ((input.proofScore ?? 0) >= 60) {
        return "editorial product imagery with proof callouts and evidence-led compositions";
    }
    if (tokens.some((token) => ["premium", "luxury", "executive"].includes(token))) {
        return "premium product imagery with negative space and restrained highlights";
    }
    return "clean product imagery with a single focal point and strong readability";
};
const inferLogoTreatment = (input) => {
    if (!input.logoUrl) {
        return "logo ainda ausente; usar placeholder de wordmark até confirmação";
    }
    const source = [input.brandArchetype, input.marketStage].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "logo como ancoragem de confiança, com presença compacta e não dominante";
    }
    if (tokens.some((token) => ["premium", "luxury", "executive"].includes(token))) {
        return "logo com respiro amplo e uso consistente de área negativa";
    }
    return "logo confirmado como marca de apoio, sem competir com a mensagem principal";
};
const inferProposalAngle = (input) => {
    const source = [input.uvp, input.marketStage, input.brandArchetype].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "proposta orientada a conversão com prova, CTA e redução de objeções";
    }
    if (tokens.some((token) => ["authority", "premium", "executive"].includes(token))) {
        return "proposta orientada a autoridade com posicionamento e valor percebido";
    }
    return "proposta orientada a clareza de oferta e próximo passo";
};
const inferCtaStyle = (input) => {
    const source = [input.marketStage, input.offerType].filter(Boolean).join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["conversion", "lead", "sale"].includes(token))) {
        return "action-first CTA";
    }
    if ((input.proofScore ?? 0) >= 60) {
        return "save-and-share CTA";
    }
    return "follow-for-more CTA";
};
const buildCreativeSources = (input) => {
    const sources = [];
    if (input.client.website_url) {
        sources.push({
            sourceUrl: input.client.website_url,
            sourceType: "client_website",
            confidence: 90,
            notes: "Official website used as the first brand and visual signal.",
        });
    }
    for (const profile of input.socialProfiles) {
        sources.push({
            sourceUrl: profile.profile_url,
            sourceType: `social_profile:${profile.platform}`,
            confidence: 100,
            notes: "Official public social profile used for channel and visual cues.",
        });
    }
    if (input.socialSnapshot?.id) {
        sources.push({
            sourceUrl: `db://social_intelligence_snapshots/${input.socialSnapshot.id}`,
            sourceType: "social_intelligence_snapshot",
            confidence: 100,
            notes: "Latest social intelligence snapshot.",
        });
    }
    if (input.brandProfile?.id) {
        sources.push({
            sourceUrl: `db://brand_profiles/${input.brandProfile.id}`,
            sourceType: "brand_profile",
            confidence: 100,
            notes: "Latest brand profile version.",
        });
    }
    if (input.offerProfile?.id) {
        sources.push({
            sourceUrl: `db://offer_profiles/${input.offerProfile.id}`,
            sourceType: "offer_profile",
            confidence: 100,
            notes: "Latest offer profile version.",
        });
    }
    if (input.clientRecord?.id) {
        sources.push({
            sourceUrl: `db://client_briefs/${input.clientRecord.id}`,
            sourceType: "client_record",
            confidence: 100,
            notes: "Latest client record version.",
        });
    }
    if (input.marketResearch?.id) {
        sources.push({
            sourceUrl: `db://market_researches/${input.marketResearch.id}`,
            sourceType: "market_research",
            confidence: 100,
            notes: "Latest market research version.",
        });
    }
    return sources;
};
export const buildCreativeProfilePayload = (input) => {
    const clientRecordPayload = asRecord(input.clientRecord?.payload_json);
    const marketResearchPayload = asRecord(input.marketResearch?.payload_json);
    const brandConfirmed = asRecord(input.brandProfile?.confirmed_json);
    const brandInferred = asRecord(input.brandProfile?.inferred_json);
    const brandProof = asRecord(input.brandProfile?.proof_json);
    const offerConfirmed = asRecord(input.offerProfileRow?.confirmed_json ?? null);
    const offerInferred = asRecord(input.offerProfileRow?.inferred_json ?? null);
    const offerProof = asRecord(input.offerProfileRow?.proof_json ?? null);
    const marketVisualPalette = getRecordArray(marketResearchPayload, ["market", "visualPalette"]);
    const visualPalette = asStringArray(brandInferred?.visualPalette ?? brandConfirmed?.visualPalette ?? marketVisualPalette);
    const socialProfiles = input.socialProfiles.map((profile) => ({
        platform: profile.platform,
        handle: profile.handle,
        profileUrl: profile.profile_url,
        confidence: profile.confidence,
    }));
    const proofPoints = [
        ...asStringArray(brandProof?.proofPoints),
        ...asStringArray(offerConfirmed?.proofPoints),
        ...asStringArray(offerProof?.proofPoints),
        ...asStringArray(input.offerProfile?.proofPoints),
    ];
    const proofGaps = [
        ...asStringArray(brandProof?.proofGaps),
        ...asStringArray(offerInferred?.proofGaps),
        ...asStringArray(input.offerProfile?.proofGaps),
    ];
    const marketStage = getRecordString(marketResearchPayload, ["market", "stage"]) ??
        getRecordString(marketResearchPayload, ["market", "maturity"]) ??
        getRecordString(clientRecordPayload, ["diagnosis", "marketStage"]) ??
        null;
    const tone = getRecordString(clientRecordPayload, ["voice", "tone"]) ?? getRecordString(brandInferred, ["toneOfVoice"]) ?? input.offerProfile?.toneOfVoice ?? null;
    const positioning = getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ??
        getRecordString(brandInferred, ["uniqueValueProposition"]) ??
        getRecordString(marketResearchPayload, ["market", "positioning"]) ??
        input.offerProfile?.summary ??
        null;
    const audience = getRecordString(clientRecordPayload, ["narrative", "audience"]) ??
        getRecordString(clientRecordPayload, ["diagnosis", "audienceContext"]) ??
        input.offerProfile?.audience ??
        input.client.segment ??
        null;
    const targetAudience = inferTargetAudience({
        audience,
        segment: input.client.segment,
        marketStage,
        offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
    });
    const buyerPersonas = inferBuyerPersonas({
        audience,
        segment: input.client.segment,
        marketStage,
        offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
    });
    const uniqueValueProposition = inferUniqueValueProposition({
        positioning,
        offerSummary: input.offerProfile?.summary ?? null,
        marketStage,
    });
    const brandArchetype = inferBrandArchetype({
        tone,
        segment: input.client.segment,
        marketStage,
    });
    const primaryChannel = socialProfiles[0]?.platform ?? "instagram";
    const supportChannels = socialProfiles.slice(1).map((profile) => profile.platform);
    const cycleLength = getRecordString(clientRecordPayload, ["cycle", "length"]) ?? getRecordString(marketResearchPayload, ["recommendations", "cadence"]) ?? "weekly";
    const goalForCycle = inferPrimaryGoal({
        presence: input.socialSnapshot?.presence_score ?? null,
        consistency: input.socialSnapshot?.consistency_score ?? null,
        proof: input.socialSnapshot?.proof_score ?? null,
        conversion: input.socialSnapshot?.conversion_readiness ?? null,
    });
    const imageRiskLevel = inferImageRiskLevel({
        proofScore: input.socialSnapshot?.proof_score ?? null,
        brandConfidence: input.brandProfile?.confidence ?? 50,
        offerConfidence: input.offerProfile?.confidence ?? 50,
    });
    const visualIdentity = inferVisualIdentity({
        brandVisualStyle: getRecordString(brandInferred, ["visualStyle"]),
        marketVisualStyle: getRecordString(marketResearchPayload, ["market", "visualStyle"]),
        tone,
        segment: input.client.segment,
    });
    const mood = inferMood({
        brandVisualStyle: getRecordString(brandInferred, ["visualStyle"]),
        tone,
        segment: input.client.segment,
        marketStage,
    });
    const brandFeel = inferBrandFeel({
        brandVisualStyle: getRecordString(brandInferred, ["visualStyle"]),
        tone,
        segment: input.client.segment,
        marketStage,
    });
    const typographyDirection = inferTypographyDirection({
        tone,
        visualStyle: getRecordString(brandInferred, ["visualStyle"]) ?? getRecordString(marketResearchPayload, ["market", "visualStyle"]) ?? null,
        segment: input.client.segment,
    });
    const layoutFamily = inferLayoutFamily({
        marketStage,
        offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
        visualStyle: getRecordString(brandInferred, ["visualStyle"]) ?? null,
    });
    const ctaStyle = inferCtaStyle({
        marketStage,
        offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
        proofScore: input.socialSnapshot?.proof_score ?? null,
    });
    const backgroundTreatment = inferBackgroundTreatment({
        mood,
        visualIdentity,
        imageRiskLevel,
        proofScore: input.socialSnapshot?.proof_score ?? null,
    });
    const overlayGuidance = inferOverlayGuidance({
        imageRiskLevel,
        mood,
        visualIdentity,
    });
    const imageStory = inferImageStory({
        targetAudience,
        offerSummary: input.offerProfile?.summary ?? input.primaryProduct?.promise ?? null,
        mood,
        visualIdentity,
    });
    const productImageryDirection = inferProductImageryDirection({
        marketStage,
        proofScore: input.socialSnapshot?.proof_score ?? null,
        offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
        segment: input.client.segment,
    });
    const logoUrl = getRecordString(brandConfirmed, ["logoUrl"]);
    const logoTreatment = inferLogoTreatment({
        logoUrl,
        brandArchetype,
        marketStage,
    });
    const proposalAngle = inferProposalAngle({
        uvp: uniqueValueProposition,
        marketStage,
        brandArchetype,
    });
    const exactNiche = input.client.segment ?? input.primaryProduct?.category ?? input.client.name;
    const allowedAdjacentSignals = [
        "proof",
        "authority",
        "clarity",
        "process",
        "results",
        "education",
        "conversion",
    ];
    const forbiddenVisualSignals = [
        "generic stock imagery",
        "overly decorative composition",
        "low-contrast text",
        "sloppy alignment",
        "blank white background without strategic reason",
    ];
    const referenceSubjects = [
        input.client.name,
        input.offerProfile?.productName ?? input.primaryProduct?.name ?? null,
        input.client.segment,
    ].filter(Boolean);
    const confidenceScore = Math.round([
        input.brandProfile?.confidence ?? 50,
        input.offerProfile?.confidence ?? 50,
        input.socialSnapshot?.confidence ?? 50,
        input.clientRecord ? 70 : 45,
        input.marketResearch ? 70 : 45,
    ].reduce((sum, value) => sum + value, 0) / 5);
    const summary = `${input.client.name} fala com ${targetAudience} com uma proposta de valor de ${uniqueValueProposition}.`;
    const statusLabel = chooseStatusLabel(confidenceScore, [input.brandProfile, input.offerProfile, input.socialSnapshot, input.clientRecord, input.marketResearch].filter(Boolean).length);
    return {
        summary,
        meta: {
            statusLabel,
            confidenceScore,
            publicOnly: input.socialSnapshot?.public_only ?? true,
            sourceIds: {
                brandProfileId: input.brandProfile?.id ?? null,
                offerProfileId: input.offerProfile?.id ?? null,
                snapshotId: input.socialSnapshot?.id ?? null,
                clientRecordId: input.clientRecord?.id ?? null,
                marketResearchId: input.marketResearch?.id ?? null,
                primaryProductId: input.primaryProduct?.id ?? null,
            },
        },
        confirmed: {
            brandName: input.client.name,
            website: input.client.website_url,
            niche: input.client.segment,
            targetAudience,
            buyerPersonas,
            uniqueValueProposition,
            brandArchetype,
            primaryChannel,
            supportChannels,
            cycleLength,
            offer: input.offerProfile?.productName ?? input.primaryProduct?.name ?? null,
            audience,
            tone: tone,
            positioning,
            goalForCycle,
            proofAvailable: proofPoints,
            visualIdentity,
            mood,
            brandFeel,
            palette: visualPalette,
            darkPaletteAnchor: visualPalette.find((item) => /black|navy|charcoal|graphite|dark/i.test(item)) ?? visualPalette[0] ?? null,
            titleColorAnchor: visualPalette.find((item) => !/black|navy|charcoal|graphite|dark/i.test(item)) ?? visualPalette[0] ?? null,
            logoUrl,
            socialProfiles,
            backgroundTreatment,
            overlayGuidance,
            imageStory,
            productImageryDirection,
            imageRecommendation: inferImageRecommendation({
                marketStage,
                proofScore: input.socialSnapshot?.proof_score ?? null,
                offerType: input.offerProfile?.offerType ?? input.primaryProduct?.offer_type ?? null,
                segment: input.client.segment,
            }),
            logoTreatment,
            proposalAngle,
            messagePillars: [
                targetAudience,
                uniqueValueProposition,
                input.offerProfile?.summary ?? input.primaryProduct?.promise ?? null,
            ].filter((value) => Boolean(value)),
        },
        inferred: {
            preferredSourceClass: input.socialProfiles.length > 0 ? "mixed-public" : "brand-only",
            imageRiskLevel,
            exactNiche,
            targetAudience,
            buyerPersonas,
            uniqueValueProposition,
            brandArchetype,
            productImageryDirection,
            logoTreatment,
            allowedAdjacentSignals,
            forbiddenVisualSignals,
            mustNotLookLike: [
                "generic agency carousel",
                "overcrowded infographic",
                "stock-photo brochure",
                "low-contrast template",
            ],
            referenceSubjects,
            typographyDirection,
            typographyRoleFocus: goalForCycle.includes("leads") ? "lead-first" : goalForCycle.includes("autoridade") ? "proof-first" : "clarity-first",
            typographyTensionLevel: imageRiskLevel === "high" ? "high" : imageRiskLevel === "medium" ? "medium" : "low",
            fontPairingStrategy: typographyDirection.includes("serif")
                ? "serif headline with neutral sans body"
                : "bold sans headline with clean sans body",
            layoutFamily,
            ctaStyle,
            proposalAngle,
            antiRepetitionWarnings: [
                "vary cover composition across the batch",
                "do not reuse the same focal point twice in a row",
                "alternate proof-heavy and message-heavy slides",
            ],
            primaryMessage: getRecordString(clientRecordPayload, ["narrative", "summary"]) ?? input.offerProfile?.summary ?? null,
            secondaryMessage: getRecordString(clientRecordPayload, ["narrative", "recommendedPositioning"]) ?? positioning,
            audienceSegments: [
                targetAudience,
                input.client.segment ?? null,
                input.offerProfile?.audience ?? null,
            ].filter((value) => Boolean(value)),
            personaHypotheses: buyerPersonas,
            logoUsage: logoTreatment,
            productImageryTreatment: productImageryDirection,
            objectionsToAddress: getRecordArray(clientRecordPayload, ["diagnosis", "objections"]),
            educationalAngle: getRecordArray(marketResearchPayload, ["recommendations", "editorialPillars"])[0] ?? null,
            proofAngle: proofGaps.length > 0 ? `Fill ${proofGaps.join(", ")}` : "Strengthen public proof",
            closingAngle: ctaStyle,
            whatMustBeVisible: ["headline", "supporting proof", "CTA", "clear hierarchy"],
            whatMustBeAvoided: ["tiny text", "generic white background", "weak contrast"],
            whatCanRepeat: ["logo placement", "signature accent color"],
            whatMustChange: ["composition", "focal point", "proof treatment"],
            mobileRiskNotes: imageRiskLevel === "high" ? "High risk: keep text minimal and contrast very strong." : "Mobile-ready with controlled density.",
        },
        proof: {
            brandProof: {
                proofPoints,
                proofGaps,
            },
            offerProof: {
                productId: input.offerProfile?.productId ?? input.primaryProduct?.id ?? null,
                summary: input.offerProfile?.summary ?? null,
                proofPoints: input.offerProfile?.proofPoints ?? [],
                proofGaps: input.offerProfile?.proofGaps ?? [],
            },
            socialProof: {
                channels: socialProfiles,
                confidence: input.socialSnapshot?.confidence ?? null,
                presenceScore: input.socialSnapshot?.presence_score ?? null,
                consistencyScore: input.socialSnapshot?.consistency_score ?? null,
                proofScore: input.socialSnapshot?.proof_score ?? null,
            },
            marketProof: {
                summary: getRecordString(marketResearchPayload, ["market", "summary"]),
                positioning: getRecordString(marketResearchPayload, ["market", "positioning"]),
                competitors: getRecordArray(marketResearchPayload, ["competition", "competitorUrls"]),
            },
            signalNotes: [
                ...(input.clientRecord ? ["client record available"] : ["client record missing"]),
                ...(input.marketResearch ? ["market research available"] : ["market research missing"]),
                ...(input.offerProfile ? ["offer profile available"] : ["offer profile missing"]),
            ],
        },
    };
};
const buildCreativeProfileSources = (input) => buildCreativeSources({
    client: input.client,
    clientRecord: input.clientRecord,
    marketResearch: input.marketResearch,
    socialSnapshot: input.socialSnapshot,
    brandProfile: input.brandProfile,
    offerProfile: input.offerProfile,
    socialProfiles: input.socialProfiles,
});
export const getCreativeProfileSignals = (creativeProfile) => {
    if (!creativeProfile) {
        return null;
    }
    const confirmed = asRecord(creativeProfile.confirmed_json);
    const inferred = asRecord(creativeProfile.inferred_json);
    const proof = asRecord(creativeProfile.proof_json);
    return {
        id: creativeProfile.id,
        version: creativeProfile.version,
        status: creativeProfile.status,
        confidence: creativeProfile.confidence,
        summary: asString((confirmed?.summary ?? inferred?.summary) ?? null),
        brandName: asString(confirmed?.brandName),
        website: asString(confirmed?.website),
        targetAudience: asString(confirmed?.targetAudience) ?? asString(inferred?.targetAudience),
        buyerPersonas: asStringArray(confirmed?.buyerPersonas ?? inferred?.buyerPersonas),
        uniqueValueProposition: asString(confirmed?.uniqueValueProposition) ?? asString(inferred?.uniqueValueProposition),
        brandArchetype: asString(confirmed?.brandArchetype) ?? asString(inferred?.brandArchetype),
        primaryChannel: asString(confirmed?.primaryChannel),
        supportChannels: asStringArray(confirmed?.supportChannels),
        cycleLength: asString(confirmed?.cycleLength),
        offer: asString(confirmed?.offer),
        audience: asString(confirmed?.audience),
        tone: asString(confirmed?.tone),
        positioning: asString(confirmed?.positioning) ?? asString(inferred?.secondaryMessage),
        goalForCycle: asString(confirmed?.goalForCycle),
        visualIdentity: asString(confirmed?.visualIdentity),
        mood: asString(confirmed?.mood) ?? asString(inferred?.mood),
        brandFeel: asString(confirmed?.brandFeel) ?? asString(inferred?.brandFeel),
        palette: asStringArray(confirmed?.palette ?? inferred?.palette),
        darkPaletteAnchor: asString(confirmed?.darkPaletteAnchor),
        titleColorAnchor: asString(confirmed?.titleColorAnchor),
        logoUrl: asString(confirmed?.logoUrl),
        logoTreatment: asString(confirmed?.logoTreatment) ?? asString(inferred?.logoTreatment),
        backgroundTreatment: asString(confirmed?.backgroundTreatment) ?? asString(inferred?.backgroundTreatment),
        overlayGuidance: asString(confirmed?.overlayGuidance) ?? asString(inferred?.overlayGuidance),
        imageStory: asString(confirmed?.imageStory) ?? asString(inferred?.imageStory),
        imageRecommendation: asString(confirmed?.imageRecommendation),
        productImageryDirection: asString(confirmed?.productImageryDirection) ?? asString(inferred?.productImageryDirection),
        imageRiskLevel: asString(inferred?.imageRiskLevel),
        layoutFamily: asString(inferred?.layoutFamily),
        ctaStyle: asString(inferred?.ctaStyle),
        proposalAngle: asString(confirmed?.proposalAngle) ?? asString(inferred?.proposalAngle),
        typographyDirection: asString(inferred?.typographyDirection),
        preferredSourceClass: asString(inferred?.preferredSourceClass),
        primaryMessage: asString(inferred?.primaryMessage),
        proofPoints: asStringArray(asRecord(proof?.brandProof)?.proofPoints),
    };
};
export const listCreativeProfiles = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const creativeProfiles = await listCreativeProfilesByClientId(input.clientId);
    return {
        client,
        creativeProfiles,
    };
};
export const getCreativeProfileContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const [latestCreativeProfile, latestClientRecord, marketResearch, socialSnapshot, socialProfiles, brandProfile, creativeProfiles, primaryProduct] = await Promise.all([
        findLatestCreativeProfileByClientId(input.clientId),
        findLatestClientRecordByClientId(input.clientId),
        findLatestMarketResearchByClientId(input.clientId),
        listLatestSnapshotByClientId(input.clientId),
        listSocialProfilesByClientId(input.clientId),
        findLatestBrandProfileByClientId(input.clientId),
        listCreativeProfilesByClientId(input.clientId),
        findPrimaryProductByClientId(input.clientId),
    ]);
    const [offerProfileRow, offerProfiles] = primaryProduct
        ? await Promise.all([findLatestOfferProfileByProductId(primaryProduct.id), listOfferProfilesByProductId(primaryProduct.id)])
        : [null, []];
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    const payload = buildCreativeProfilePayload({
        client: {
            id: client.id,
            name: client.name,
            slug: client.slug,
            website_url: client.website_url,
            segment: client.segment,
            status: client.status,
            notes: client.notes,
        },
        clientRecord: latestClientRecord
            ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
            : null,
        marketResearch: marketResearch
            ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
            : null,
        socialSnapshot,
        socialProfiles: socialProfiles.map((profile) => ({
            platform: profile.platform,
            handle: profile.handle,
            profile_url: profile.profile_url,
            confidence: profile.confidence,
        })),
        brandProfile,
        offerProfileRow,
        offerProfile,
        primaryProduct,
    });
    return {
        client,
        latestCreativeProfile,
        creativeProfile: latestCreativeProfile
            ? getCreativeProfileSignals(latestCreativeProfile)
            : {
                id: null,
                client_id: client.id,
                version: 0,
                status: "draft",
                confidence: payload.meta.confidenceScore,
                ...payload.confirmed,
                ...payload.inferred,
                draft: true,
            },
        creativeProfiles,
        payload,
        sources: {
            clientRecord: latestClientRecord,
            marketResearch,
            socialSnapshot,
            socialProfiles,
            brandProfile,
            offerProfile: offerProfileRow,
            primaryProduct,
            offerProfiles,
        },
    };
};
export const createCreativeProfile = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const [latestClientRecord, marketResearch, socialSnapshot, socialProfiles, brandProfile, primaryProduct] = await Promise.all([
        findLatestClientRecordByClientId(input.clientId),
        findLatestMarketResearchByClientId(input.clientId),
        listLatestSnapshotByClientId(input.clientId),
        listSocialProfilesByClientId(input.clientId),
        findLatestBrandProfileByClientId(input.clientId),
        findPrimaryProductByClientId(input.clientId),
    ]);
    const [offerProfileRow, offerProfiles] = primaryProduct
        ? await Promise.all([findLatestOfferProfileByProductId(primaryProduct.id), listOfferProfilesByProductId(primaryProduct.id)])
        : [null, []];
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    const payload = buildCreativeProfilePayload({
        client: {
            id: client.id,
            name: client.name,
            slug: client.slug,
            website_url: client.website_url,
            segment: client.segment,
            status: client.status,
            notes: client.notes,
        },
        clientRecord: latestClientRecord
            ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
            : null,
        marketResearch: marketResearch
            ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
            : null,
        socialSnapshot,
        socialProfiles: socialProfiles.map((profile) => ({
            platform: profile.platform,
            handle: profile.handle,
            profile_url: profile.profile_url,
            confidence: profile.confidence,
        })),
        brandProfile,
        offerProfileRow,
        offerProfile,
        primaryProduct,
    });
    const creativeProfile = await createCreativeProfileVersion({
        clientId: input.clientId,
        sourceBrandProfileId: brandProfile?.id ?? null,
        sourceOfferProfileId: offerProfileRow?.id ?? null,
        sourceSnapshotId: socialSnapshot?.id ?? null,
        sourceClientRecordId: latestClientRecord?.id ?? null,
        sourceMarketResearchId: marketResearch?.id ?? null,
        status: input.status,
        confidence: payload.meta.confidenceScore,
        confirmed: {
            ...payload.confirmed,
            note: input.note ?? null,
            createdFrom: "evidence-draft",
        },
        inferred: payload.inferred,
        proof: payload.proof,
    });
    const sources = buildCreativeProfileSources({
        client: {
            website_url: client.website_url,
        },
        clientRecord: latestClientRecord ? { id: latestClientRecord.id } : null,
        marketResearch: marketResearch ? { id: marketResearch.id } : null,
        socialSnapshot: socialSnapshot ? { id: socialSnapshot.id } : null,
        brandProfile: brandProfile ? { id: brandProfile.id } : null,
        offerProfile: offerProfileRow ? { id: offerProfileRow.id } : null,
        socialProfiles: socialProfiles.map((profile) => ({ profile_url: profile.profile_url, platform: profile.platform })),
    });
    if (sources.length > 0) {
        await createCreativeProfileSources(creativeProfile.id, sources);
    }
    const creativeProfiles = await listCreativeProfilesByClientId(input.clientId);
    return {
        client,
        creativeProfile,
        creativeProfiles,
        payload: {
            ...payload.confirmed,
            ...payload.inferred,
            ...payload.proof,
            note: input.note ?? null,
            createdFrom: "evidence-draft",
        },
        sources,
    };
};
export const reviseCreativeProfile = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const latestCreativeProfile = await findLatestCreativeProfileByClientId(input.clientId);
    if (!latestCreativeProfile || typeof latestCreativeProfile.confirmed_json !== "object" || latestCreativeProfile.confirmed_json === null) {
        throw createError("FAILED_PRECONDITION", "Creative profile is required before revision", 422);
    }
    const [latestClientRecord, marketResearch, socialSnapshot, socialProfiles, brandProfile, primaryProduct] = await Promise.all([
        findLatestClientRecordByClientId(input.clientId),
        findLatestMarketResearchByClientId(input.clientId),
        listLatestSnapshotByClientId(input.clientId),
        listSocialProfilesByClientId(input.clientId),
        findLatestBrandProfileByClientId(input.clientId),
        findPrimaryProductByClientId(input.clientId),
    ]);
    const [offerProfileRow, offerProfiles] = primaryProduct
        ? await Promise.all([findLatestOfferProfileByProductId(primaryProduct.id), listOfferProfilesByProductId(primaryProduct.id)])
        : [null, []];
    const offerProfile = getOfferProfileSignals(offerProfileRow);
    const payload = buildCreativeProfilePayload({
        client: {
            id: client.id,
            name: client.name,
            slug: client.slug,
            website_url: client.website_url,
            segment: client.segment,
            status: client.status,
            notes: client.notes,
        },
        clientRecord: latestClientRecord
            ? { id: latestClientRecord.id, payload_json: latestClientRecord.payload_json, version: latestClientRecord.version }
            : null,
        marketResearch: marketResearch
            ? { id: marketResearch.id, payload_json: marketResearch.payload_json, version: marketResearch.version }
            : null,
        socialSnapshot,
        socialProfiles: socialProfiles.map((profile) => ({
            platform: profile.platform,
            handle: profile.handle,
            profile_url: profile.profile_url,
            confidence: profile.confidence,
        })),
        brandProfile,
        offerProfileRow,
        offerProfile,
        primaryProduct,
    });
    const nextConfirmed = {
        ...payload.confirmed,
        note: input.note ?? null,
    };
    const nextInferred = {
        ...payload.inferred,
        summary: input.summaryOverride ?? payload.summary,
    };
    const creativeProfile = await updateCreativeProfileVersion({
        clientId: input.clientId,
        sourceBrandProfileId: brandProfile?.id ?? null,
        sourceOfferProfileId: offerProfileRow?.id ?? null,
        sourceSnapshotId: socialSnapshot?.id ?? null,
        sourceClientRecordId: latestClientRecord?.id ?? null,
        sourceMarketResearchId: marketResearch?.id ?? null,
        status: input.status,
        confidence: payload.meta.confidenceScore,
        confirmed: nextConfirmed,
        inferred: nextInferred,
        proof: payload.proof,
    });
    const sources = buildCreativeProfileSources({
        client: {
            website_url: client.website_url,
        },
        clientRecord: latestClientRecord ? { id: latestClientRecord.id } : null,
        marketResearch: marketResearch ? { id: marketResearch.id } : null,
        socialSnapshot: socialSnapshot ? { id: socialSnapshot.id } : null,
        brandProfile: brandProfile ? { id: brandProfile.id } : null,
        offerProfile: offerProfileRow ? { id: offerProfileRow.id } : null,
        socialProfiles: socialProfiles.map((profile) => ({ profile_url: profile.profile_url, platform: profile.platform })),
    });
    if (sources.length > 0) {
        await createCreativeProfileSources(creativeProfile.id, sources);
    }
    const creativeProfiles = await listCreativeProfilesByClientId(input.clientId);
    return {
        client,
        creativeProfile,
        creativeProfiles,
        payload: {
            ...nextConfirmed,
            ...nextInferred,
            ...payload.proof,
            note: input.note ??
                (typeof latestCreativeProfile.confirmed_json === "object" && latestCreativeProfile.confirmed_json !== null
                    ? (asString(asRecord(latestCreativeProfile.confirmed_json)?.note) ?? null)
                    : null),
            revisedFromCreativeProfileVersion: latestCreativeProfile.version,
            createdFrom: "manual-edit",
        },
        sources,
    };
};
