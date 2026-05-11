import { randomUUID } from "node:crypto";
import { query, queryOne, withTransaction } from "../../shared/db/database.js";
const TABLE_NAME = "client_products";
let schemaReady = null;
export const ensureProductSchema = async () => {
    if (!schemaReady) {
        schemaReady = (async () => {
            await query(`create table if not exists ${TABLE_NAME} (
          id text primary key,
          client_id text not null,
          name text not null,
          slug text not null,
          category text null,
          offer_type text null,
          price_label text null,
          promise text not null,
          problem_solved text not null,
          audience text not null,
          status text not null,
          priority integer not null default 0,
          landing_url text null,
          proof_points_json jsonb not null default '[]'::jsonb,
          notes text null,
          is_active boolean not null default false,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          unique(client_id, slug)
        )`);
            await query(`create index if not exists ${TABLE_NAME}_client_id_idx on ${TABLE_NAME} (client_id)`);
            await query(`create index if not exists ${TABLE_NAME}_client_id_active_idx on ${TABLE_NAME} (client_id, is_active desc, priority desc, updated_at desc)`);
        })();
    }
    return schemaReady;
};
export const listProductsByClientId = async (clientId) => {
    await ensureProductSchema();
    return query(`select
       id,
       client_id,
       name,
       slug,
       category,
       offer_type,
       price_label,
       promise,
       problem_solved,
       audience,
       status,
       priority,
       landing_url,
       proof_points_json,
       notes,
       is_active,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by is_active desc, priority desc, updated_at desc, created_at desc`, [clientId]);
};
export const findProductById = async (productId) => {
    await ensureProductSchema();
    return queryOne(`select
       id,
       client_id,
       name,
       slug,
       category,
       offer_type,
       price_label,
       promise,
       problem_solved,
       audience,
       status,
       priority,
       landing_url,
       proof_points_json,
       notes,
       is_active,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where id = $1
     limit 1`, [productId]);
};
export const findPrimaryProductByClientId = async (clientId) => {
    await ensureProductSchema();
    return queryOne(`select
       id,
       client_id,
       name,
       slug,
       category,
       offer_type,
       price_label,
       promise,
       problem_solved,
       audience,
       status,
       priority,
       landing_url,
       proof_points_json,
       notes,
       is_active,
       created_at,
       updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by is_active desc, priority desc, updated_at desc, created_at desc
     limit 1`, [clientId]);
};
const normalizeStatus = (status) => (status === "prioritized" || status === "in_campaign" ? true : false);
export const createProductRecord = async (input) => {
    await ensureProductSchema();
    const id = randomUUID();
    const isActive = normalizeStatus(input.status);
    const result = await withTransaction(async (client) => {
        const created = await client.query(`insert into ${TABLE_NAME} (
        id,
        client_id,
        name,
        slug,
        category,
        offer_type,
        price_label,
        promise,
        problem_solved,
        audience,
        status,
        priority,
        landing_url,
        proof_points_json,
        notes,
        is_active
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16)
      returning
        id,
        client_id,
        name,
        slug,
        category,
        offer_type,
        price_label,
        promise,
        problem_solved,
        audience,
        status,
        priority,
        landing_url,
        proof_points_json,
        notes,
        is_active,
        created_at,
        updated_at`, [
            id,
            input.clientId,
            input.name,
            input.slug,
            input.category ?? null,
            input.offerType ?? null,
            input.priceLabel ?? null,
            input.promise,
            input.problemSolved,
            input.audience,
            input.status,
            input.priority,
            input.landingUrl ?? null,
            JSON.stringify(input.proofPoints),
            input.notes ?? null,
            isActive,
        ]);
        return created.rows[0];
    });
    return result;
};
export const updateProductRecord = async (productId, input) => {
    await ensureProductSchema();
    const existing = await findProductById(productId);
    if (!existing) {
        return null;
    }
    const nextStatus = input.status ?? existing.status;
    const nextIsActive = normalizeStatus(nextStatus);
    const updated = await queryOne(`update ${TABLE_NAME}
     set
       name = coalesce($2, name),
       slug = coalesce($3, slug),
       category = coalesce($4, category),
       offer_type = coalesce($5, offer_type),
       price_label = coalesce($6, price_label),
       promise = coalesce($7, promise),
       problem_solved = coalesce($8, problem_solved),
       audience = coalesce($9, audience),
       status = coalesce($10, status),
       priority = coalesce($11, priority),
       landing_url = coalesce($12, landing_url),
       proof_points_json = coalesce($13::jsonb, proof_points_json),
       notes = coalesce($14, notes),
       is_active = $15,
       updated_at = now()
     where id = $1
     returning
       id,
       client_id,
       name,
       slug,
       category,
       offer_type,
       price_label,
       promise,
       problem_solved,
       audience,
       status,
       priority,
       landing_url,
       proof_points_json,
       notes,
       is_active,
       created_at,
       updated_at`, [
        productId,
        input.name ?? null,
        input.slug ?? null,
        input.category ?? null,
        input.offerType ?? null,
        input.priceLabel ?? null,
        input.promise ?? null,
        input.problemSolved ?? null,
        input.audience ?? null,
        input.status ?? null,
        input.priority ?? null,
        input.landingUrl ?? null,
        input.proofPoints ? JSON.stringify(input.proofPoints) : null,
        input.notes ?? null,
        nextIsActive,
    ]);
    return updated;
};
export const activateProductRecord = async (productId) => {
    await ensureProductSchema();
    const existing = await findProductById(productId);
    if (!existing) {
        return null;
    }
    await withTransaction(async (client) => {
        await client.query(`update ${TABLE_NAME}
       set is_active = false,
           updated_at = now()
       where client_id = $1`, [existing.client_id]);
        await client.query(`update ${TABLE_NAME}
       set is_active = true,
           updated_at = now()
       where id = $1`, [productId]);
    });
    return findProductById(productId);
};
export const deleteProductRecord = async (productId) => {
    await ensureProductSchema();
    await withTransaction(async (client) => {
        await client.query(`delete from ${TABLE_NAME} where id = $1`, [productId]);
    });
};
