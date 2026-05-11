import { query, queryOne, withTransaction } from "../../shared/db/database.js";
export const findUserByEmail = async (email) => queryOne(`select id, name, email, password_hash, status
     from users
     where email = $1`, [email]);
export const findUserById = async (userId) => queryOne(`select id, name, email, status
     from users
     where id = $1`, [userId]);
export const listMembershipsByUserId = async (userId) => query(`select
       m.agency_id,
       m.role,
       a.name as agency_name,
       a.slug as agency_slug,
       a.plan as agency_plan,
       a.status as agency_status
     from memberships m
     join agencies a on a.id = m.agency_id
     where m.user_id = $1
     order by a.created_at desc`, [userId]);
export const countUsers = async () => {
    const row = await queryOne("select count(*)::text as count from users");
    return Number(row?.count ?? 0);
};
export const findFirstMembership = async () => queryOne(`select user_id, agency_id
     from memberships
     order by created_at asc
     limit 1`);
export const findFirstMembershipWithClients = async () => queryOne(`select m.user_id, m.agency_id
     from memberships m
     where exists (
       select 1
       from clients c
       where c.agency_id = m.agency_id
     )
     order by m.created_at asc
     limit 1`);
export const createUser = async (client, input) => {
    const result = await client.query(`insert into users (name, email, password_hash)
     values ($1, $2, $3)
     returning id, name, email`, [input.name, input.email, input.passwordHash]);
    return result.rows[0];
};
export const createMembership = async (client, input) => {
    const result = await client.query(`insert into memberships (agency_id, user_id, role, permissions_json)
     values ($1, $2, $3, $4::jsonb)
     returning id`, [input.agencyId, input.userId, input.role, JSON.stringify(input.permissions)]);
    return result.rows[0];
};
export const bootstrapIdentity = async (input) => withTransaction(async (client) => {
    const agencyResult = await client.query(`insert into agencies (name, slug)
       values ($1, $2)
       returning id, name, slug`, [input.agency.name, input.agency.slug]);
    const user = await createUser(client, {
        name: input.user.name,
        email: input.user.email,
        passwordHash: input.user.passwordHash,
    });
    await createMembership(client, {
        agencyId: agencyResult.rows[0].id,
        userId: user.id,
        role: "admin_agency",
        permissions: ["*"],
    });
    return {
        agency: agencyResult.rows[0],
        user,
    };
});
