-- PingBoard Supabase Database Schema
-- Based on Django models, optimized for Supabase

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types for categories
CREATE TYPE ping_category AS ENUM ('event', 'sale', 'help', 'misc');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pings table (main content)
CREATE TABLE pings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL CHECK (char_length(text) <= 280),
    category ping_category DEFAULT 'misc',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    hashtags TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table (many-to-many for upvotes/downvotes)
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ping_id UUID REFERENCES pings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ping_id, user_id, vote_type)
);

-- Indexes for performance (based on Django patterns)
CREATE INDEX idx_pings_created_at ON pings(created_at DESC);
CREATE INDEX idx_pings_category ON pings(category);
CREATE INDEX idx_pings_location ON pings(location);
CREATE INDEX idx_pings_user_id ON pings(user_id);
CREATE INDEX idx_votes_ping_id ON votes(ping_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Pings policies
CREATE POLICY "Anyone can view pings" ON pings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pings" ON pings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pings" ON pings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pings" ON pings
    FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_ping_vote_count(ping_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(
            CASE 
                WHEN vote_type = 'upvote' THEN 1 
                WHEN vote_type = 'downvote' THEN -1 
                ELSE 0 
            END
        ), 0)
        FROM votes 
        WHERE ping_id = ping_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pings_updated_at 
    BEFORE UPDATE ON pings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
