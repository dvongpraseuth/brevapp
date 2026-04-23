-- Objectifs de récompenses
CREATE TABLE rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  cost_xp     INT NOT NULL CHECK (cost_xp > 0),
  requested   BOOLEAN DEFAULT FALSE,
  approved    BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_rewards" ON rewards
  FOR ALL USING (auth.uid() = user_id);

-- Parent voit ET peut approuver les rewards de son enfant
CREATE POLICY "parent_manages_child_rewards" ON rewards
  FOR ALL USING (
    user_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid())
  );

-- Données par défaut pour Noah (à adapter via l'app)
-- INSERT INTO rewards (user_id, label, cost_xp) VALUES
--   ('NOAH_UUID', '🎮 Manette PS5', 5000),
--   ('NOAH_UUID', '🎬 Ciné + McDo', 2500),
--   ('NOAH_UUID', '👟 Nouvelles baskets', 4000);
