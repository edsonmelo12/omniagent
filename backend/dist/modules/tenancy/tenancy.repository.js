import { query, queryOne, withTransaction } from "../../shared/db/database.js";
export const listAgenciesByUserId = async (userId) => query(`select
       a.id,
       a.name,
       a.slug,
       a.plan,
       a.status,
       a.branding_json,
       a.created_at,
       a.updated_at,
       m.role
     from agencies a
     join memberships m on m.agency_id = a.id
     where m.user_id = $1
     order by a.created_at desc`, [userId]);
export const createAgency = async (input) => withTransaction(async (client) => {
    const result = await client.query(`insert into agencies (name, slug, plan)
       values ($1, $2, $3)
       returning id, name, slug, plan, status, branding_json, created_at, updated_at`, [input.name, input.slug, input.plan]);
    return result.rows[0];
});
export const createAgencyWithMembership = async (input) => withTransaction(async (client) => {
    const agencyResult = await client.query(`insert into agencies (name, slug, plan)
       values ($1, $2, $3)
       returning id, name, slug, plan, status, branding_json, created_at, updated_at`, [input.name, input.slug, input.plan]);
    await client.query(`insert into memberships (agency_id, user_id, role, permissions_json)
       values ($1, $2, $3, $4::jsonb)`, [agencyResult.rows[0].id, input.userId, "admin_agency", JSON.stringify(["*"])]);
    return agencyResult.rows[0];
});
export const findAgencyById = async (agencyId) => queryOne(`select id, name, slug, plan, status, branding_json, created_at, updated_at
     from agencies
     where id = $1`, [agencyId]);
export const findAgencyBySlug = async (slug) => queryOne(`select id, name, slug, plan, status, branding_json, created_at, updated_at
     from agencies
     where slug = $1`, [slug]);
export const assertAgencyMembership = async (userId, agencyId) => {
    const membership = await queryOne(`select id from memberships where user_id = $1 and agency_id = $2`, [userId, agencyId]);
    return Boolean(membership);
};
