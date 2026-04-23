-- Progression par notion
CREATE TABLE progress (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notion_id  TEXT NOT NULL,
  subject    TEXT NOT NULL CHECK (subject IN ('maths','francais','histoire','sciences')),
  status     TEXT NOT NULL DEFAULT 'non_vu'
             CHECK (status IN ('non_vu','vu_en_cours','en_cours_assimilation','maitrise')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notion_id)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "parent_sees_child_progress" ON progress
  FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid())
  );

-- Index pour les requêtes fréquentes
CREATE INDEX idx_progress_user_subject ON progress(user_id, subject);
