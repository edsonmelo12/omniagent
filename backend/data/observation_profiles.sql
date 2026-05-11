-- Opensquad Client Credentials Database
-- Stores credentials for monitoring platforms per client

CREATE TABLE IF NOT EXISTS observation_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_slug TEXT NOT NULL UNIQUE,
    display_name TEXT,
    
    -- Meta (Instagram + Facebook)
    meta_access_token TEXT,
    meta_page_id TEXT,
    instagram_user_id TEXT,
    
    -- GA4
    ga4_property_id TEXT,
    ga4_credentials_path TEXT,
    
    -- WordPress
    wp_url TEXT,
    wp_user TEXT,
    wp_app_password TEXT,
    
    -- Other
    imgbb_api_key TEXT,
    
    -- Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')));

CREATE INDEX IF NOT EXISTS idx_client_slug ON observation_profiles(client_slug);

-- Insert Amiclube credentials
INSERT OR REPLACE INTO observation_profiles (
    client_slug, display_name,
    meta_access_token, meta_page_id, instagram_user_id,
    ga4_property_id, ga4_credentials_path,
    wp_url, wp_user, wp_app_password,
    imgbb_api_key
) VALUES (
    'amiclube', 'Amiclube - Por Sara Melo',
    'EAAL6v95Jzz4BRFIw14mewCZAFLmbyzyPgIhwvsuoGNkuxidQ8Ji7uOZAr232cl3WtiHPbD1ZC9ZAtVrMckY0FXvXSJvkZAjHaWZAC0LeYg5ifupoiJp1JDklVOXJesOxWRRBgmb2qZCfbcGF2GxFLcvVNFHWucZBSwT5Y31wRsMkeI7b0gHZAZA1LJpxtCT4B79tdqNr579mMeCMAxAAZDZD',
    '106701834627196',
    '17841444481115973',
    '302524520',
    'backend/.secrets/ga4-amiclube.json',
    'https://amiclube.com.br',
    'edsonrmjunior',
    'CoBy YZRb OjNf tUV3 I9sw Ma6Q',
    'c0292d46612797b17c497298600d48b9'
);