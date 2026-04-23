-- Statistiques de gamification
CREATE TABLE game_stats (
  user_id        UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp             INT DEFAULT 0 CHECK (xp >= 0),
  streak         INT DEFAULT 0 CHECK (streak >= 0),
  best_streak    INT DEFAULT 0,
  last_session   DATE,
  total_sessions INT DEFAULT 0,
  flash_sessions INT DEFAULT 0,
  badges         TEXT[] DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_stats" ON game_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "parent_sees_child_stats" ON game_stats
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid())
  );

-- Sessions de révision
CREATE TABLE sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  duration_min INT NOT NULL CHECK (duration_min > 0),
  xp_earned    INT DEFAULT 0,
  score_ok     INT DEFAULT 0,
  score_flou   INT DEFAULT 0,
  score_non    INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "parent_sees_child_sessions" ON sessions
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid())
  );
