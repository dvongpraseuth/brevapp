-- Profils utilisateurs (élèves + parents)
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT DEFAULT 'student' CHECK (role IN ('student','parent')),
  parent_id  UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Chaque user voit son propre profil
CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Parent voit le profil de son enfant
CREATE POLICY "parent_sees_child_profile" ON profiles
  FOR SELECT USING (parent_id = auth.uid());
