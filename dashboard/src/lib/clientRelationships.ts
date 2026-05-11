import type { Client } from "@/types/backend";

const PARENT_BRAND_REGEX = /(?:parent brand|marca[- ]?m[aã]e|marca principal)\s*:\s*([^\n\r;.]+)/i;

export function getClientParentBrandName(client: Pick<Client, "notes" | "parent_client_name"> | null): string | null {
  if (client?.parent_client_name?.trim()) {
    return client.parent_client_name.trim();
  }

  const notes = client?.notes?.trim();
  if (!notes) return null;

  const match = notes.match(PARENT_BRAND_REGEX);
  return match?.[1]?.trim() ?? null;
}

export function getClientRelationshipLabel(client: Pick<Client, "notes" | "parent_client_name"> | null): string | null {
  const parentBrandName = getClientParentBrandName(client);
  if (!parentBrandName) return null;

  return `Produto de ${parentBrandName}`;
}
