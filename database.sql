-- Database Schema for File Sharing Application
-- Generated from AdonisJS migrations
-- Compatible with PostgreSQL

-- Roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Permissions table
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Role Permissions table (junction table)
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(180) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  totp_secret VARCHAR(255),
  is_totp_enabled BOOLEAN NOT NULL DEFAULT false,
  role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  public_key TEXT,
  encrypted_private_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jwt_token TEXT NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  device_name VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
);

-- Folders table
CREATE TABLE folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  path VARCHAR(255) NOT NULL,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  encryption_method VARCHAR(50),
  encryption_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
  folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
);

-- File Shares table
CREATE TABLE file_shares (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  access_type VARCHAR(255) NOT NULL DEFAULT 'view',
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_token VARCHAR(100) UNIQUE,
  expired_at TIMESTAMP WITH TIME ZONE,
  encrypted_key_for_recipient TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- File Keys table
CREATE TABLE file_keys (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(file_id, user_id)
);

-- User Roles table (junction table)
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, role_id)
);

-- Auth Access Tokens table
CREATE TABLE auth_access_tokens (
  id SERIAL PRIMARY KEY,
  tokenable_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  hash VARCHAR(255) NOT NULL,
  abilities TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for activities table
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_file_id ON activities(file_id);
CREATE INDEX idx_activities_folder_id ON activities(folder_id);
CREATE INDEX idx_activities_action ON activities(action);
CREATE INDEX idx_activities_created_at ON activities(created_at);