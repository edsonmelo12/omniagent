import { createHash } from "node:crypto";
import { createError } from "../../shared/http/errors.js";
import { countUsers, bootstrapIdentity, findFirstMembership, findFirstMembershipWithClients, listMembershipsByUserId, findUserByEmail, findUserById, } from "./auth.repository.js";
const hashPassword = (password) => `sha256:${createHash("sha256").update(password).digest("hex")}`;
const verifyPassword = (password, passwordHash) => {
    if (passwordHash.startsWith("plain:")) {
        return passwordHash.slice("plain:".length) === password;
    }
    if (passwordHash.startsWith("sha256:")) {
        return passwordHash === hashPassword(password);
    }
    return passwordHash === password;
};
export const login = async (input) => {
    const user = await findUserByEmail(input.email);
    if (!user || user.status !== "active" || !verifyPassword(input.password, user.password_hash)) {
        throw createError("UNAUTHORIZED", "Invalid credentials", 401);
    }
    const memberships = await listMembershipsByUserId(user.id);
    return {
        accessToken: `demo:${user.id}`,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
        },
        agencies: memberships.map((membership) => ({
            id: membership.agency_id,
            name: membership.agency_name,
            slug: membership.agency_slug,
            plan: membership.agency_plan,
            status: membership.agency_status,
            role: membership.role,
        })),
    };
};
export const anonymousLogin = async () => {
    const membership = (await findFirstMembershipWithClients()) ?? (await findFirstMembership());
    if (!membership) {
        throw createError("NOT_FOUND", "No workspace available for anonymous access", 404);
    }
    const user = await findUserById(membership.user_id);
    if (!user) {
        throw createError("NOT_FOUND", "Anonymous user not found", 404);
    }
    const memberships = await listMembershipsByUserId(user.id);
    const agencies = memberships.map((membershipRow) => ({
        id: membershipRow.agency_id,
        name: membershipRow.agency_name,
        slug: membershipRow.agency_slug,
        plan: membershipRow.agency_plan,
        status: membershipRow.agency_status,
        role: membershipRow.role,
    }));
    const preferredAgencyId = membership.agency_id;
    const preferredAgencyIndex = agencies.findIndex((agency) => agency.id === preferredAgencyId);
    if (preferredAgencyIndex > 0) {
        const [preferredAgency] = agencies.splice(preferredAgencyIndex, 1);
        agencies.unshift(preferredAgency);
    }
    return {
        accessToken: `demo:${user.id}`,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
        },
        agencies,
    };
};
export const me = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
        throw createError("NOT_FOUND", "User not found", 404);
    }
    const memberships = await listMembershipsByUserId(userId);
    return {
        user,
        agencies: memberships.map((membership) => ({
            id: membership.agency_id,
            name: membership.agency_name,
            slug: membership.agency_slug,
            plan: membership.agency_plan,
            status: membership.agency_status,
            role: membership.role,
        })),
    };
};
export const bootstrap = async (input) => {
    const usersCount = await countUsers();
    if (usersCount > 0) {
        throw createError("CONFLICT", "Platform already bootstrapped", 409);
    }
    const bootstrapResult = await bootstrapIdentity({
        agency: input.agency,
        user: {
            name: input.user.name,
            email: input.user.email,
            passwordHash: hashPassword(input.user.password),
        },
    });
    const memberships = await listMembershipsByUserId(bootstrapResult.user.id);
    return {
        accessToken: `demo:${bootstrapResult.user.id}`,
        user: bootstrapResult.user,
        agencies: memberships.map((membership) => ({
            id: membership.agency_id,
            name: membership.agency_name,
            slug: membership.agency_slug,
            plan: membership.agency_plan,
            status: membership.agency_status,
            role: membership.role,
        })),
    };
};
