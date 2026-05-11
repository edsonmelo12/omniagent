import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  status: string;
};

export type MembershipRow = {
  agency_id: string;
  role: string;
  agency_name: string;
  agency_slug: string;
  agency_plan: string;
  agency_status: string;
};

export const findUserByEmail = async (email: string) =>
  queryOne<AuthUserRow>(
    `select id, name, email, password_hash, status
     from users
     where email = $1`,
    [email],
  );

export const findUserById = async (userId: string) =>
  queryOne<Omit<AuthUserRow, "password_hash">>(
    `select id, name, email, status
     from users
     where id = $1`,
    [userId],
  );

export const listMembershipsByUserId = async (userId: string) =>
  query<MembershipRow>(
    `select
       m.agency_id,
       m.role,
       a.name as agency_name,
       a.slug as agency_slug,
       a.plan as agency_plan,
       a.status as agency_status
     from memberships m
     join agencies a on a.id = m.agency_id
     where m.user_id = $1
     order by a.created_at desc`,
    [userId],
  );

export const countUsers = async () => {
  const row = await queryOne<{ count: string }>("select count(*)::text as count from users");
  return Number(row?.count ?? 0);
};

export const findFirstMembership = async () =>
  queryOne<{ user_id: string; agency_id: string }>(
    `select user_id, agency_id
     from memberships
     order by created_at asc
     limit 1`,
  );

export const findFirstMembershipWithClients = async () =>
  queryOne<{ user_id: string; agency_id: string }>(
    `select m.user_id, m.agency_id
     from memberships m
     where exists (
       select 1
       from clients c
       where c.agency_id = m.agency_id
     )
     order by m.created_at asc
     limit 1`,
  );

export const createUser = async (
  client: import("pg").PoolClient,
  input: { name: string; email: string; passwordHash: string },
) => {
  const result = await client.query<{ id: string; name: string; email: string }>(
    `insert into users (name, email, password_hash)
     values ($1, $2, $3)
     returning id, name, email`,
    [input.name, input.email, input.passwordHash],
  );

  return result.rows[0];
};

export const createMembership = async (
  client: import("pg").PoolClient,
  input: { agencyId: string; userId: string; role: string; permissions: string[] },
) => {
  const result = await client.query<{ id: string }>(
    `insert into memberships (agency_id, user_id, role, permissions_json)
     values ($1, $2, $3, $4::jsonb)
     returning id`,
    [input.agencyId, input.userId, input.role, JSON.stringify(input.permissions)],
  );

  return result.rows[0];
};

export const bootstrapIdentity = async (input: {
  agency: { name: string; slug: string };
  user: { name: string; email: string; passwordHash: string };
}) =>
  withTransaction(async (client) => {
    const agencyResult = await client.query<{ id: string; name: string; slug: string }>(
      `insert into agencies (name, slug)
       values ($1, $2)
       returning id, name, slug`,
      [input.agency.name, input.agency.slug],
    );

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
