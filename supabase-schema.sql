-- Exhale App - Supabase Database Schema
-- This schema supports no-contact healing journey tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- 1. PROFILES TABLE
-- ================================
-- Main user profile table containing onboarding data and progress tracking
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  gender TEXT, -- 'male', 'female', 'non-binary', 'prefer-not-to-say'
  
  -- Relationship and breakup data
  breakup_date DATE,
  last_contact_date TIMESTAMPTZ, -- When they last contacted their ex
  streak_start TIMESTAMPTZ, -- When they started their no-contact journey
  
  -- Goals and progress
  goal_days INTEGER DEFAULT 30, -- Their no-contact goal in days
  
  -- Onboarding assessment data (stored as JSONB for flexibility)
  triggers JSONB DEFAULT '[]'::jsonb, -- Array of trigger situations
  challenges JSONB DEFAULT '[]'::jsonb, -- Array of anticipated challenges
  panic_tools JSONB DEFAULT '[]'::jsonb, -- Array of panic management tools
  motivations JSONB DEFAULT '[]'::jsonb, -- Array of motivations for no-contact
  
  -- Psychological assessment scores (1-10 scale)
  attachment_score INTEGER, -- How attached they were (10 = very attached)
  readiness_score INTEGER, -- How ready they are to heal (10 = very ready)
  
  -- App state
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ================================
-- 2. PLEDGES TABLE
-- ================================
-- Daily commitment pledges to maintain no-contact
CREATE TABLE pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pledge_date DATE NOT NULL, -- The date this pledge was made for
  completed BOOLEAN DEFAULT FALSE, -- Whether they completed the day successfully
  check_in_date TIMESTAMPTZ, -- When they marked it as completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one pledge per user per day
  UNIQUE(user_id, pledge_date)
);

-- Row Level Security for pledges
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pledges" ON pledges
  FOR ALL USING (auth.uid() = user_id);

-- Index for efficient date-based queries
CREATE INDEX idx_pledges_user_date ON pledges(user_id, pledge_date DESC);

-- ================================
-- 3. JOURNAL ENTRIES TABLE
-- ================================
-- Personal journal entries for emotional tracking and reflection
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL, -- The date this entry is for
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10), -- 1-10 mood scale
  body TEXT NOT NULL, -- The journal entry content
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for journal entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Index for efficient date-based queries
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

-- ================================
-- 4. MILESTONES TABLE
-- ================================
-- Achievement milestones users can unlock
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "First Day", "One Week", "One Month"
  description TEXT NOT NULL,
  requirement_days INTEGER NOT NULL, -- Days needed to unlock this milestone
  badge_variant TEXT NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum', 'iridescent'
  reward_message TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default milestones
INSERT INTO milestones (name, description, requirement_days, badge_variant, reward_message, sort_order) VALUES
('First Step', 'Every journey begins with a single step. You''ve made the commitment.', 1, 'bronze', 'Bronze Achievement', 1),
('Building Momentum', 'You''re developing new patterns and breaking old habits.', 7, 'silver', 'Silver Achievement', 2),
('Major Milestone', 'Significant progress in your healing journey. Your brain is rewiring.', 30, 'gold', 'Gold Achievement', 3),
('Transformation', 'You''ve shown incredible dedication and formed lasting new habits.', 90, 'platinum', 'Platinum Achievement', 4);

-- Public read access for milestones (everyone can see available milestones)
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view milestones" ON milestones FOR SELECT TO authenticated USING (true);

-- ================================
-- 5. USER MILESTONES TABLE
-- ================================
-- Track which milestones each user has achieved
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure each milestone can only be achieved once per user
  UNIQUE(user_id, milestone_id)
);

-- Row Level Security for user milestones
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON user_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON user_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for efficient milestone queries
CREATE INDEX idx_user_milestones_user ON user_milestones(user_id);

-- ================================
-- 6. PANIC SESSIONS TABLE
-- ================================
-- Track panic/urge episodes and intervention success
CREATE TABLE panic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Initial state
  initial_urge_level INTEGER CHECK (initial_urge_level >= 1 AND initial_urge_level <= 10),
  initial_mood_level INTEGER CHECK (initial_mood_level >= 1 AND initial_mood_level <= 10),
  
  -- Intervention used
  intervention_type TEXT, -- 'breathing', 'consequences', 'grounding', etc.
  intervention_duration INTEGER, -- seconds spent on intervention
  
  -- Outcome
  outcome TEXT, -- 'feeling_better', 'still_struggling', 'contact_made'
  final_urge_level INTEGER CHECK (final_urge_level >= 1 AND final_urge_level <= 10),
  final_mood_level INTEGER CHECK (final_mood_level >= 1 AND final_mood_level <= 10),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for panic sessions
ALTER TABLE panic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own panic sessions" ON panic_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Index for analytics
CREATE INDEX idx_panic_sessions_user_date ON panic_sessions(user_id, session_date DESC);

-- ================================
-- 7. PROGRESS SNAPSHOTS TABLE
-- ================================
-- Periodic snapshots of user progress for analytics and insights
CREATE TABLE progress_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  
  -- Progress metrics
  current_streak INTEGER NOT NULL,
  goal_days INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) NOT NULL,
  
  -- Behavioral metrics
  pledges_made INTEGER DEFAULT 0,
  pledges_completed INTEGER DEFAULT 0,
  journal_entries INTEGER DEFAULT 0,
  panic_sessions INTEGER DEFAULT 0,
  
  -- Calculated insights (stored for historical analysis)
  emotional_healing_score DECIMAL(5,2),
  mental_clarity_score DECIMAL(5,2),
  personal_growth_score DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One snapshot per user per day
  UNIQUE(user_id, snapshot_date)
);

-- Row Level Security for progress snapshots
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress snapshots" ON progress_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- Index for trend analysis
CREATE INDEX idx_progress_snapshots_user_date ON progress_snapshots(user_id, snapshot_date DESC);

-- ================================
-- 8. AUTOMATED FUNCTIONS
-- ================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the update trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pledges_updated_at BEFORE UPDATE ON pledges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 9. HELPFUL VIEWS
-- ================================

-- View for current user progress
CREATE VIEW user_current_progress AS
SELECT 
  p.id,
  p.name,
  p.streak_start,
  p.goal_days,
  CASE 
    WHEN p.streak_start IS NOT NULL 
    THEN GREATEST(0, EXTRACT(days FROM NOW() - p.streak_start)::INTEGER)
    ELSE 0 
  END as current_streak,
  CASE 
    WHEN p.streak_start IS NOT NULL AND p.goal_days > 0
    THEN LEAST(100, (GREATEST(0, EXTRACT(days FROM NOW() - p.streak_start)::INTEGER) * 100.0 / p.goal_days))
    ELSE 0 
  END as progress_percentage,
  (SELECT COUNT(*) FROM pledges WHERE user_id = p.id) as total_pledges,
  (SELECT COUNT(*) FROM pledges WHERE user_id = p.id AND completed = true) as completed_pledges,
  (SELECT COUNT(*) FROM journal_entries WHERE user_id = p.id) as total_journal_entries,
  (SELECT COUNT(*) FROM panic_sessions WHERE user_id = p.id) as total_panic_sessions
FROM profiles p;

-- Row Level Security for the view
ALTER VIEW user_current_progress SET (security_invoker = true);

-- Grant necessary permissions
GRANT SELECT ON user_current_progress TO authenticated;

-- ================================
-- 10. SAMPLE DATA (Optional - for testing)
-- ================================

-- Example milestone for user's custom goal (will be inserted programmatically)
-- INSERT INTO milestones (name, description, requirement_days, badge_variant, reward_message, sort_order) 
-- VALUES ('Goal Complete', 'You''ve achieved your personal goal and demonstrated true mastery.', 30, 'iridescent', 'Ultimate Achievement', 999);

-- ================================
-- 11. USAGE NOTES
-- ================================

/*
USAGE INSTRUCTIONS:

1. Copy this entire schema and run it in your Supabase SQL editor
2. This will create all necessary tables with proper Row Level Security
3. Your app is already configured to work with these table structures

KEY FEATURES:
- Automatic user isolation via RLS (users only see their own data)
- Efficient indexing for common queries
- Flexible JSONB storage for dynamic arrays (triggers, motivations, etc.)
- Progress tracking and milestone system
- Journal and panic session tracking
- Historical progress snapshots for analytics

AUTHENTICATION:
- Uses Supabase Auth with UUID primary keys
- All user data is automatically isolated
- No additional authentication setup needed in your app

MIGRATIONS:
- This schema is designed to be run on a fresh database
- For existing data, you may need to adjust based on current state
- Consider backing up any existing data before running
*/

