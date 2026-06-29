-- AlphaHawk Database Schema
-- This file creates all tables for the TreeHunt game

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE trees(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_tag_id VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    common_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    times_assigned INTEGER DEFAULT 0 NOT NULL,
    times_found INTEGER DEFAULT 0 NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL default 'active',
    photo_url VARCHAR(255),
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_status CHECK (status IN ('active', 'submitted', 'completed', 'expired', 'skipped'))
);
-- looked up every time a student opens the app
CREATE INDEX idx_quests_user_id ON quests(user_id);
-- filtered constantly to find active quests
CREATE INDEX idx_quests_status ON quests(status);
--  looked up on every login
CREATE INDEX idx_users_email ON users(email);
-- spatial queries need a special index called GIST
CREATE INDEX idx_trees_location ON trees USING GIST(location);

