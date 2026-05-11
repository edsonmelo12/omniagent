#!/usr/bin/env node
// Shared database module for observation profiles

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Database from 'better-sqlite3';

const DB_PATH = resolve('/home/edsonrmjunior/Local Sites/omniagent', 'backend', 'data', 'observation_profiles.db');

let db = null;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

export function getProfile(clientSlug) {
  const stmt = getDb().prepare('SELECT * FROM observation_profiles WHERE client_slug = ?');
  return stmt.get(clientSlug);
}

export function listProfiles() {
  const stmt = getDb().prepare('SELECT client_slug, display_name, ga4_property_id, meta_page_id FROM observation_profiles');
  return stmt.all();
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}