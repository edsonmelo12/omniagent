import { createError } from "../../shared/http/errors.js";
import { createClient, deleteClient, findClientById, listClientsByAgencyId, updateClient } from "./clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";

export const listClients = async (input: { userId: string; agencyId: string; search?: string; limit: number }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const clients = await listClientsByAgencyId(input.agencyId, {
    search: input.search,
    limit: input.limit,
  });

  return clients;
};

export const getClient = async (input: { userId: string; agencyId: string; clientId: string }) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  return client;
};

export const createClientWorkspace = async (input: {
  userId: string;
  agencyId: string;
  name: string;
  slug: string;
  segment?: string;
  websiteUrl?: string;
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);

  return createClient({
    agencyId: input.agencyId,
    name: input.name,
    slug: input.slug,
    segment: input.segment,
    websiteUrl: input.websiteUrl,
    notes: input.notes,
  });
};

export const reviseClientWorkspace = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  name?: string;
  slug?: string;
  segment?: string;
  websiteUrl?: string;
  notes?: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const currentClient = await findClientById(input.agencyId, input.clientId);

  if (!currentClient) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const updatedClient = await updateClient(input.clientId, {
    name: input.name,
    slug: input.slug,
    segment: input.segment,
    websiteUrl: input.websiteUrl,
    notes: input.notes,
  });

  if (!updatedClient) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  return updatedClient;
};

export const deleteClientWorkspace = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const currentClient = await findClientById(input.agencyId, input.clientId);

  if (!currentClient) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const deletedClient = await deleteClient(input.clientId);

  if (!deletedClient) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  return currentClient;
};
