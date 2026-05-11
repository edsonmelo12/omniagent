import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findProductById } from "../client-products/client-products.repository.js";
import { createOfferProfileVersion, findLatestOfferProfileByClientId, findLatestOfferProfileByProductId, listOfferProfilesByClientId, listOfferProfilesByProductId, } from "./offer-profile.repository.js";
const asRecord = (value) => (typeof value === "object" && value !== null ? value : null);
const asString = (value) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const asStringArray = (value) => Array.isArray(value) ? value.map((item) => asString(item)).filter((item) => Boolean(item)) : [];
const lowerTokens = (value) => (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
const inferPrimaryCta = (input) => {
    const source = [
        input.product.offer_type,
        input.product.price_label,
        input.product.status,
        input.brandProfile?.primaryCta,
    ]
        .filter(Boolean)
        .join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["service", "servico", "consultoria", "agency"].includes(token))) {
        return "Solicitar conversa";
    }
    if (tokens.some((token) => ["course", "curso", "training", "treinamento"].includes(token))) {
        return "Começar agora";
    }
    if (tokens.some((token) => ["in_campaign", "prioritized", "lead", "leadgen", "conversion", "sale"].includes(token))) {
        return input.brandProfile?.primaryCta ?? "Pedir proposta";
    }
    return input.brandProfile?.primaryCta ?? "Falar sobre esta oferta";
};
const inferTone = (input) => {
    const source = [input.product.offer_type, input.product.status, input.product.category, input.brandProfile?.toneOfVoice]
        .filter(Boolean)
        .join(" ");
    const tokens = lowerTokens(source);
    if (tokens.some((token) => ["course", "curso", "training", "treinamento", "educational"].includes(token))) {
        return "didactic, clear and confidence-building";
    }
    if (tokens.some((token) => ["service", "servico", "consultoria", "agency"].includes(token))) {
        return "clear, consultative and practical";
    }
    if (tokens.some((token) => ["in_campaign", "prioritized", "conversion", "lead"].includes(token))) {
        return "direct and conversion-oriented";
    }
    return input.brandProfile?.toneOfVoice ?? "clear and credible";
};
const inferProofGaps = (proofPoints) => {
    const proofGaps = new Set(["testimonials", "reviews", "cases", "before-after", "process proof"]);
    const lowerProofSignals = proofPoints.map((item) => item.toLowerCase());
    const hasTestimonialsEvidence = lowerProofSignals.some((item) => lowerTokens(item).some((token) => ["testimonial", "testimonials", "depoimento"].includes(token)));
    const hasReviewsEvidence = lowerProofSignals.some((item) => lowerTokens(item).some((token) => ["review", "reviews", "avaliacao", "rating"].includes(token)));
    const hasCasesEvidence = lowerProofSignals.some((item) => lowerTokens(item).some((token) => ["case", "cases", "case study", "caso", "casos"].includes(token)));
    const hasBeforeAfterEvidence = lowerProofSignals.some((item) => lowerTokens(item).some((token) => ["antes", "depois", "before", "after"].includes(token)));
    const hasProcessEvidence = lowerProofSignals.some((item) => lowerTokens(item).some((token) => ["process", "processo", "bastidor", "rotina"].includes(token)));
    if (hasTestimonialsEvidence)
        proofGaps.delete("testimonials");
    if (hasReviewsEvidence)
        proofGaps.delete("reviews");
    if (hasCasesEvidence)
        proofGaps.delete("cases");
    if (hasBeforeAfterEvidence)
        proofGaps.delete("before-after");
    if (hasProcessEvidence)
        proofGaps.delete("process proof");
    return Array.from(proofGaps);
};
const getProductSignalText = (product) => [product.name, product.promise, product.problem_solved, product.audience, product.category, product.offer_type]
    .filter(Boolean)
    .join(" ");
const normalizeProfileStatus = (productStatus) => {
    if (productStatus === "draft")
        return "draft";
    if (productStatus === "validated")
        return "review";
    if (productStatus === "archived")
        return "draft";
    return "approved";
};
export const getOfferProfileSignals = (offerProfile) => {
    if (!offerProfile) {
        return null;
    }
    const confirmed = asRecord(offerProfile.confirmed_json);
    const inferred = asRecord(offerProfile.inferred_json);
    const proof = asRecord(offerProfile.proof_json);
    return {
        id: offerProfile.id,
        version: offerProfile.version,
        status: offerProfile.status,
        confidence: offerProfile.confidence,
        summary: asString(inferred?.summary) ?? asString(confirmed?.summary) ?? null,
        productId: asString(confirmed?.productId) ?? asString(proof?.sourceProductId) ?? "",
        productName: asString(confirmed?.productName) ?? "",
        category: asString(confirmed?.category),
        offerType: asString(confirmed?.offerType),
        priceLabel: asString(confirmed?.priceLabel),
        audience: asString(confirmed?.audience),
        promise: asString(confirmed?.promise),
        problemSolved: asString(confirmed?.problemSolved),
        landingUrl: asString(confirmed?.landingUrl),
        primaryCta: asString(inferred?.primaryCta),
        toneOfVoice: asString(inferred?.toneOfVoice),
        proofPoints: asStringArray(confirmed?.proofPoints),
        proofGaps: asStringArray(inferred?.proofGaps),
    };
};
export const buildOfferProfilePayload = (input) => {
    const proofPoints = Array.isArray(input.product.proof_points_json)
        ? input.product.proof_points_json.map(String).filter((item) => item.trim().length > 0)
        : [];
    const primaryCta = inferPrimaryCta(input);
    const toneOfVoice = inferTone(input);
    const proofGaps = inferProofGaps(proofPoints);
    const summary = `${input.product.name} resolve ${input.product.problem_solved} para ${input.product.audience}`;
    return {
        status: normalizeProfileStatus(input.product.status),
        confidence: proofPoints.length > 0 ? 72 : 52,
        confirmed: {
            productId: input.product.id,
            clientId: input.client.id,
            productName: input.product.name,
            category: input.product.category,
            offerType: input.product.offer_type,
            priceLabel: input.product.price_label,
            audience: input.product.audience,
            promise: input.product.promise,
            problemSolved: input.product.problem_solved,
            landingUrl: input.product.landing_url,
            proofPoints,
            summary,
        },
        inferred: {
            summary,
            primaryCta,
            toneOfVoice,
            proofGaps,
            desiredOutcome: input.product.promise,
            audienceFocus: input.product.audience,
            positioning: input.brandProfile?.uniqueValueProposition ?? input.brandProfile?.promise ?? input.product.promise,
        },
        proof: {
            sourceProductId: input.product.id,
            sourceProductUpdatedAt: input.product.updated_at,
            basis: getProductSignalText(input.product),
            proofPoints,
            proofGaps,
        },
    };
};
export const syncOfferProfileFromProduct = async (input) => (() => {
    const payload = buildOfferProfilePayload(input);
    return createOfferProfileVersion({
        clientId: input.client.id,
        productId: input.product.id,
        status: payload.status,
        confidence: payload.confidence,
        confirmed: payload.confirmed,
        inferred: payload.inferred,
        proof: payload.proof,
    });
})();
export const getOfferProfilesContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const products = await listOfferProfilesByClientId(input.clientId);
    const latest = await findLatestOfferProfileByClientId(input.clientId);
    return {
        client,
        offerProfiles: products,
        offerProfile: latest,
    };
};
export const getOfferProfileForProduct = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const product = await findProductById(input.productId);
    if (!product) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    const client = await findClientById(input.agencyId, product.client_id);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const offerProfiles = await listOfferProfilesByProductId(input.productId);
    const offerProfile = await findLatestOfferProfileByProductId(input.productId);
    return {
        client,
        product,
        offerProfile,
        offerProfiles,
    };
};
