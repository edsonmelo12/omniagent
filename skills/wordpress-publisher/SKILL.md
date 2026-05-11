---
name: wordpress-publisher
description: >
  Publish content to WordPress sites using the REST API. Supports creating 
  drafts, uploading media, and setting taxonomies.
description_pt-BR: >
  Publica conteúdo em sites WordPress usando a API REST. Suporta a criação 
  de rascunhos, upload de mídia e definição de taxonomias.
type: script
version: "1.0.0"
runtime: node
invocation: "npx tsx {skill}/scripts/publish.ts"
env:
  - WORDPRESS_URL
  - WORDPRESS_USER
  - WORDPRESS_APP_PASSWORD
categories: [publishing, wordpress, automation]
---

# WordPress Publisher

## When to use

Use this skill when a squad needs to export generated blog posts or pages to a WordPress site. It should be used after content has been reviewed and approved.

## Operating principles

1. **Safety First**: Default to creating `draft` status posts. Never publish `live` unless explicitly instructed.
2. **Media Handling**: Always check if a featured image is provided and upload it to the media library before creating the post.
3. **Formatting**: Ensure HTML or blocks are properly formatted for the Gutenberg editor.
4. **Metadata**: Include SEO metadata, categories, and tags when available.

## Standard workflow

### 1. Prepare Content
Gather the title, body (HTML or Markdown), excerpt, and featured image path.

### 2. Invoke Publisher
Run the publication script with the necessary parameters.

### 3. Record Feedback
Capture the WordPress Post ID and the Edit URL to provide back to the user.

## Environment Variables

- `WORDPRESS_URL`: The base URL of the WordPress site (e.g., `https://example.com`).
- `WORDPRESS_USER`: The username of the account to use for publishing.
- `WORDPRESS_APP_PASSWORD`: An Application Password generated in WordPress (Users -> Profile).
