ALTER TABLE publishing_profiles
DROP CONSTRAINT IF EXISTS publishing_profiles_channel_check,
DROP CONSTRAINT IF EXISTS publishing_profiles_provider_check;

ALTER TABLE publishing_profiles
ADD CONSTRAINT publishing_profiles_channel_check
CHECK (channel IN ('instagram','facebook','linkedin','pinterest','tiktok','youtube','wordpress'));

ALTER TABLE publishing_profiles
ADD CONSTRAINT publishing_profiles_provider_check
CHECK (provider IN ('rube','meta_graph','linkedin_api','youtube_api','buffer','manual','wordpress_api'));
