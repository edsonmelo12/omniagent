#!/usr/bin/env node
// Shared credentials module for observation platforms
// Loads from .env.publish.{client} files in squads/social-growth/

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const SQUAD_PATH = resolve('/home/edsonrmjunior/Local Sites/omniagent', 'squads', 'social-growth');

export function loadClientEnv(clientSlug) {
  const envPath = join(SQUAD_PATH, `.env.publish.${clientSlug}`);
  
  if (!existsSync(envPath)) {
    throw new Error(`Credentials not found for client: ${clientSlug}`);
  }
  
  const env = {};
  const content = readFileSync(envPath, 'utf8');
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  }
  
  return env;
}

export function getProfile(clientSlug) {
  const env = loadClientEnv(clientSlug);
  
  return {
    client_slug: clientSlug,
    
    // Meta
    meta_access_token: env.FACEBOOK_ACCESS_TOKEN,
    meta_page_id: env.FACEBOOK_PAGE_ID,
    instagram_user_id: env.INSTAGRAM_USER_ID,
    instagram_access_token: env.INSTAGRAM_ACCESS_TOKEN,
    
    // GA4
    ga4_property_id: env.GA4_PROPERTY_ID,
    
    // WordPress
    wp_url: env.WORDPRESS_URL,
    wp_user: env.WORDPRESS_USER,
    wp_app_password: env.WORDPRESS_APP_PASSWORD,
    
    // Other
    imgbb_api_key: env.IMGBB_API_KEY,
  };
}

export function listClients() {
  // Simple list - in production would query DB
  return ['amiclube'];
}