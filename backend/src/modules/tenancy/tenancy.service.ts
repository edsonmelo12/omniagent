import { createError } from "../../shared/http/errors.js";
import { assertAgencyMembership, createAgency, createAgencyWithMembership, findAgencyById, listAgenciesByUserId } from "./tenancy.repository.js";

export const listAgencies = async (userId: string) => listAgenciesByUserId(userId);

export const createAgencyWorkspace = async (input: { name: string; slug: string; plan: string; userId?: string }) => {
  const agency = input.userId
    ? await createAgencyWithMembership({
        name: input.name,
        slug: input.slug,
        plan: input.plan,
        userId: input.userId,
      })
    : await createAgency(input);

  return agency;
};

export const requireAgencyAccess = async (userId: string, agencyId: string) => {
  const agency = await findAgencyById(agencyId);

  if (!agency) {
    throw createError("NOT_FOUND", "Agency not found", 404);
  }

  const allowed = await assertAgencyMembership(userId, agencyId);

  if (!allowed) {
    throw createError("FORBIDDEN", "Agency access denied", 403);
  }

  return agency;
};
