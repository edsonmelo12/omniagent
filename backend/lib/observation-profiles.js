#!/usr/bin/env node
// Database credentials module
// Loads observation profiles from PostgreSQL

import { query, queryOne } from '../shared/db/database.js';
import { readFileSync } from 'node:fs';

export async function getObservationProfiles(clientSlug) {
  const profiles = await query(`
    SELECT op.* 
    FROM observation_profiles op
    JOIN clients c ON c.id = op.client_id
    WHERE c.slug = $1 AND op.status = 'active'
  `, [clientSlug]);
  
  return profiles;
}

export async function getProfileByChannel(clientSlug, channel) {
  const profile = await queryOne(`
    SELECT op.* 
    FROM observation_profiles op
    JOIN clients c ON c.id = op.client_id
    WHERE c.slug = $1 AND op.channel = $2 AND op.status = 'active'
  `, [clientSlug, channel]);
  
  return profile;
}

export async function getMetaCredentials(clientSlug) {
  const instagram = await getProfileByChannel(clientSlug, 'instagram');
  const facebook = await getProfileByChannel(clientSlug, 'facebook');
  
  return {
    instagram: instagram ? {
      accountId: instagram.account_ref,
      accessToken: resolveSecret(instagram.secret_ref),
    } : null,
    facebook: facebook ? {
      pageId: facebook.account_ref,
      accessToken: resolveSecret(facebook.secret_ref),
    } : null,
  };
}

export async function getGA4Credentials(clientSlug) {
  const ga4 = await getProfileByChannel(clientSlug, 'site');
  
  if (!ga4) return null;
  
  return {
    propertyId: ga4.property_ref,
    credentialsPath: resolveFilePath(ga4.secret_ref),
  };
}

function resolveSecret(secretRef) {
  if (!secretRef) return null;
  
  if (secretRef.startsWith('env://')) {
    const envKey = secretRef.slice(5);
    return process.env[envKey] ?? null;
  }
  
  return null;
}

function resolveFilePath(secretRef) {
  if (!secretRef) return null;
  
  if (secretRef.startsWith('file://')) {
    return secretRef.slice(7);
  }
  
  return null;
}