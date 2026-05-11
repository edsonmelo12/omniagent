import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { activateProductRecord, createProductRecord, deleteProductRecord, findProductById, listProductsByClientId, updateProductRecord, } from "./client-products.repository.js";
import { syncOfferProfileFromProduct } from "../offer-profile/offer-profile.service.js";
const slugify = (input) => input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const toProductPayload = (product) => ({
    ...product,
    proof_points: Array.isArray(product.proof_points_json) ? product.proof_points_json.map(String) : [],
});
export const getProductsContext = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const products = await listProductsByClientId(input.clientId);
    return {
        client,
        products: products.map(toProductPayload),
    };
};
export const createProduct = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const product = await createProductRecord({
        clientId: input.clientId,
        name: input.name,
        slug: input.slug?.trim() || slugify(input.name),
        category: input.category,
        offerType: input.offerType,
        priceLabel: input.priceLabel,
        promise: input.promise,
        problemSolved: input.problemSolved,
        audience: input.audience,
        status: input.status,
        priority: input.priority,
        landingUrl: input.landingUrl,
        proofPoints: input.proofPoints,
        notes: input.notes,
    });
    await syncOfferProfileFromProduct({
        client,
        product,
        brandProfile: null,
    });
    const products = await listProductsByClientId(input.clientId);
    return {
        client,
        product: toProductPayload(product),
        products: products.map(toProductPayload),
    };
};
export const reviseProduct = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const product = await findProductById(input.productId);
    if (!product) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    const client = await findClientById(input.agencyId, product.client_id);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const updated = await updateProductRecord(input.productId, {
        name: input.name,
        slug: input.slug?.trim() || undefined,
        category: input.category,
        offerType: input.offerType,
        priceLabel: input.priceLabel,
        promise: input.promise,
        problemSolved: input.problemSolved,
        audience: input.audience,
        status: input.status,
        priority: input.priority,
        landingUrl: input.landingUrl,
        proofPoints: input.proofPoints,
        notes: input.notes,
    });
    if (!updated) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    await syncOfferProfileFromProduct({
        client,
        product: updated,
        brandProfile: null,
    });
    const products = await listProductsByClientId(product.client_id);
    return {
        client,
        product: toProductPayload(updated),
        products: products.map(toProductPayload),
    };
};
export const activateProduct = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const product = await findProductById(input.productId);
    if (!product) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    const client = await findClientById(input.agencyId, product.client_id);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const updated = await activateProductRecord(input.productId);
    if (!updated) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    await syncOfferProfileFromProduct({
        client,
        product: updated,
        brandProfile: null,
    });
    const products = await listProductsByClientId(product.client_id);
    return {
        client,
        product: toProductPayload(updated),
        products: products.map(toProductPayload),
    };
};
export const deleteProduct = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const product = await findProductById(input.productId);
    if (!product) {
        throw createError("NOT_FOUND", "Product not found", 404);
    }
    const client = await findClientById(input.agencyId, product.client_id);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await deleteProductRecord(input.productId);
    let products = await listProductsByClientId(product.client_id);
    if (product.is_active && products.length > 0 && !products.some((item) => item.is_active)) {
        await activateProductRecord(products[0].id);
        const activated = await findProductById(products[0].id);
        if (activated) {
            await syncOfferProfileFromProduct({
                client,
                product: activated,
                brandProfile: null,
            });
        }
        products = await listProductsByClientId(product.client_id);
    }
    return {
        client,
        product: toProductPayload(product),
        products: products.map(toProductPayload),
    };
};
