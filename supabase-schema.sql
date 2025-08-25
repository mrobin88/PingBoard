-- ============================================================================
-- PINGBOARD SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================================================
-- CREATE ENUMS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE ping_category AS ENUM ('event', 'sale', 'help', 'misc');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ping_status AS ENUM ('active', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE vote_type AS ENUM ('upvote', 'downvote');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    email TEXT UNIQUE NOT NULL,
    bio TEXT CHECK (char_length(bio) <= 500),
    avatar_url TEXT,
    location TEXT CHECK (char_length(location) <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pings table (main content)
CREATE TABLE IF NOT EXISTS pings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL CHECK (char_length(text) <= 280),
    category ping_category DEFAULT 'misc',
    status ping_status DEFAULT 'active',
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    location TEXT CHECK (char_length(location) <= 100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    hashtags TEXT[] DEFAULT '{}',
    seo_description TEXT CHECK (char_length(seo_description) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table (many-to-many for upvotes/downvotes)
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ping_id UUID REFERENCES pings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ping_id, user_id)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pings_user_id ON pings(user_id);
CREATE INDEX IF NOT EXISTS idx_pings_created_at ON pings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pings_category ON pings(category);
CREATE INDEX IF NOT EXISTS idx_pings_status ON pings(status);
CREATE INDEX IF NOT EXISTS idx_pings_hashtags ON pings USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_votes_ping_id ON votes(ping_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_timestamp ON profiles;
CREATE TRIGGER update_profiles_timestamp
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- Trigger for pings table
DROP TRIGGER IF EXISTS update_pings_timestamp ON pings;
CREATE TRIGGER update_pings_timestamp
    BEFORE UPDATE ON pings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new user signup
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
CREATE TRIGGER handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile_on_signup();

-- ============================================================================
-- CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Pings policies
DROP POLICY IF EXISTS "Anyone can view active pings" ON pings;
CREATE POLICY "Anyone can view active pings" ON pings
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Authenticated users can create pings" ON pings;
CREATE POLICY "Authenticated users can create pings" ON pings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pings" ON pings;
CREATE POLICY "Users can update own pings" ON pings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pings" ON pings;
CREATE POLICY "Users can delete own pings" ON pings
    FOR DELETE USING (auth.uid() = user_id);

-- Votes policies
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON votes;
CREATE POLICY "Users can update own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON votes;
CREATE POLICY "Users can delete own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function to get ping vote count
CREATE OR REPLACE FUNCTION get_ping_vote_count(ping_uuid UUID)
RETURNS TABLE(upvotes BIGINT, downvotes BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE v.vote_type = 'upvote') as upvotes,
        COUNT(*) FILTER (WHERE v.vote_type = 'downvote') as downvotes
    FROM votes v
    WHERE v.ping_id = ping_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to extract hashtags from text
CREATE OR REPLACE FUNCTION extract_hashtags(text_content TEXT)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT DISTINCT unnest(
            regexp_matches(text_content, '#(\w+)', 'g')
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE VIEWS
-- ============================================================================

-- View for active pings with vote counts
CREATE OR REPLACE VIEW active_pings_with_votes AS
SELECT 
    p.*,
    p.username,
    COALESCE(upvotes.count, 0) as upvotes,
    COALESCE(downvotes.count, 0) as downvotes,
    (COALESCE(upvotes.count, 0) - COALESCE(downvotes.count, 0)) as score
FROM pings p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM votes v
    WHERE v.ping_id = p.id AND v.vote_type = 'upvote'
) upvotes ON true
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM votes v
    WHERE v.ping_id = p.id AND v.vote_type = 'downvote'
) downvotes ON true
WHERE p.status = 'active'
ORDER BY p.created_at DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON pings TO anon, authenticated;
GRANT ALL ON votes TO anon, authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Insert a sample ping (uncomment if you want test data)
-- INSERT INTO pings (text, category, user_id, hashtags) VALUES 
-- ('Welcome to PingBoard! 🚀 Share your first message with #hello', 'misc', 
--  (SELECT id FROM profiles LIMIT 1), ARRAY['hello', 'welcome']);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('profiles', 'pings', 'votes');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'pings', 'votes');

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'pings', 'votes');

-- ============================================================================
-- SCHEMA COMPLETE! 🎉
-- ============================================================================
-- Your PingBoard database is now ready!
-- Users can sign up, create profiles, post pings, and vote!
