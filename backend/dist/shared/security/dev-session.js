import { env } from "../../app/env.js";
import { queryOne } from "../db/database.js";
const DEFAULT_DEV_USER_EMAIL = "edson@portaldemidias.com";
const DEFAULT_DEV_AGENCY_SLUG = "social-growth";
let cachedDevSession = null;
let initPromise = null;
const loadDevSession = async () => {
    const preferredUser = await queryOne(`select id
     from users
     where email = $1
     limit 1`, [DEFAULT_DEV_USER_EMAIL]);
    const preferredAgency = await queryOne(`select id
     from agencies
     where slug = $1
     limit 1`, [DEFAULT_DEV_AGENCY_SLUG]);
    if (preferredUser && preferredAgency) {
        const membership = await queryOne(`select id
       from memberships
       where user_id = $1 and agency_id = $2
       limit 1`, [preferredUser.id, preferredAgency.id]);
        if (membership) {
            return {
                userId: preferredUser.id,
                agencyId: preferredAgency.id,
            };
        }
    }
    const fallbackMembership = await queryOne(`select user_id, agency_id
     from memberships
     order by created_at asc
     limit 1`);
    if (fallbackMembership) {
        return {
            userId: fallbackMembership.user_id,
            agencyId: fallbackMembership.agency_id,
        };
    }
    const firstUser = preferredUser ?? (await queryOne(`select id from users order by created_at asc limit 1`));
    const firstAgency = preferredAgency ?? (await queryOne(`select id from agencies order by created_at asc limit 1`));
    if (firstUser && firstAgency) {
        return {
            userId: firstUser.id,
            agencyId: firstAgency.id,
        };
    }
    return null;
};
export const initializeDevSession = async () => {
    if (env.NODE_ENV !== "development") {
        cachedDevSession = null;
        return null;
    }
    if (cachedDevSession) {
        return cachedDevSession;
    }
    if (!initPromise) {
        initPromise = loadDevSession().then((session) => {
            cachedDevSession = session;
            return session;
        });
    }
    return initPromise;
};
export const getDevSession = () => cachedDevSession;
