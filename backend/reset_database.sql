-- Reset Database Script
-- Run this to clean up database before running fresh migrations

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS file_keys CASCADE;
DROP TABLE IF EXISTS file_shares CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS auth_access_tokens CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop migrations table to start fresh
DROP TABLE IF EXISTS adonis_schema CASCADE;
DROP TABLE IF EXISTS adonis_schema_versions CASCADE;

-- Verify all tables are dropped
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
