# Migration Order

## Purpose

Define the order for the database migrations that formalize the operating flow into PostgreSQL.

This order applies to the persisted records that back the squad workflow.

## Migration 001 - Identity and Access

Tables:
- agencies
- users
- memberships

Goal:
- create tenants
- create users
- assign roles and permissions

## Migration 002 - Client Core

Tables:
- clients
- client_sites

Goal:
- register client workspaces
- store website and primary site links

## Migration 003 - Social Discovery

Tables:
- social_profiles

Goal:
- link official social profiles to each client
- store discovery source and confidence

## Migration 004 - Social Intelligence

Tables:
- social_intelligence_snapshots
- social_intelligence_sources

Goal:
- persist public signals
- persist confirmed analytics
- keep evidence and confidence

## Migration 005 - Client Record and Research

Tables:
- client_briefs
- market_researches

Goal:
- store the editable client record
- store the market synthesis

## Migration 006 - Commercial Proposal

Tables:
- proposals

Goal:
- store the chosen archetype
- store the proposal thesis and payload

## Migration 007 - Content and Schedule

Tables:
- content_plans
- content_production_packages
- schedules

Goal:
- support the execution layer after the proposal is approved

## Migration 008 - Approvals and Monitoring

Tables:
- approvals
- monitoring_reports

Goal:
- track approvals
- track performance and actions

## Migration 009 - Evidence

Tables:
- evidence_files

Goal:
- store source files, screenshots and external references

## Migration 010 - YouTube Strategy Analyses

Tables:
- youtube_strategy_analyses

Goal:
- persist transcript-driven strategy analyses from podcasts, cases and interviews
- keep versioned analysis payloads

## Migration 011 - Strategy Intelligence Assets

Tables:
- strategy_intelligence_assets

Goal:
- persist reusable strategic assets extracted from the analysis layer
- rank alternative strategies and maintain history by version

## Migration 012 - Publishing Executions

Tables:
- publishing_executions

Goal:
- persist dry-run and live publishing execution records

## Migration 013 - Social Presence

Tables:
- social_presence_snapshots

Goal:
- persist social presence history from provider APIs and fallback collection

## Migration 014 - Brand Profiles

Tables:
- brand_profiles
- brand_profile_sources

Goal:
- persist the confirmed and inferred brand profile
- keep source evidence attached to the brand layer

## Migration 015 - Client Products

Tables:
- client_products

Goal:
- persist the active product and service catalog
- maintain offer priorities and proof points

## Migration 016 - Offer Profiles

Tables:
- offer_profiles

Goal:
- persist versioned offer intelligence for each active product

## Migration 017 - Creative Profiles

Tables:
- creative_profiles
- creative_profile_sources

Goal:
- persist the approved creative system for each client
- keep palette, typography, layout and source constraints versioned

## Order Rule

Build migrations in this order so no downstream table depends on a missing upstream entity.

## Final Recommendation

This migration order mirrors the persistence flow in the platform:
tenant -> client -> social -> client record -> proposal -> execution -> monitoring -> evidence -> youtube analysis -> strategy intelligence assets -> publishing -> social presence -> brand -> products -> offers -> creative profiles
