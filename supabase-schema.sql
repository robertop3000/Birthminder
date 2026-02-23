-- ============================================
-- Birthminder — Complete Database Schema
-- ============================================
-- Run this in Supabase > SQL Editor
-- Last updated: 2026-02-19

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  notification_days_before INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People table (stores birthdays)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthday_day INTEGER NOT NULL CHECK (birthday_day >= 1 AND birthday_day <= 31),
  birthday_month INTEGER NOT NULL CHECK (birthday_month >= 1 AND birthday_month <= 12),
  birthday_year INTEGER CHECK (birthday_year > 1900 AND birthday_year <= 2100),
  photo_url TEXT,
  notes TEXT,
  share_code TEXT UNIQUE,
  contact_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table (for organizing people)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  photo_url TEXT,
  share_code TEXT UNIQUE,
  source_share_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Person-Group junction table (many-to-many relationship)
CREATE TABLE person_groups (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, group_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_people_user_id ON people(user_id);
CREATE INDEX idx_people_birthday ON people(birthday_month, birthday_day);
CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_person_groups_person ON person_groups(person_id);
CREATE INDEX idx_person_groups_group ON person_groups(group_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_groups ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- People policies
CREATE POLICY "Users can view their own people"
  ON people FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own people"
  ON people FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
  ON people FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
  ON people FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared people"
  ON people FOR SELECT
  USING (share_code IS NOT NULL);

-- Groups policies
CREATE POLICY "Users can view their own groups"
  ON groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON groups FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared groups"
  ON groups FOR SELECT
  USING (share_code IS NOT NULL);

-- Person-Groups junction table policies
CREATE POLICY "Users can view person_groups for their people"
  ON person_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = person_groups.person_id
      AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert person_groups for their people"
  ON person_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = person_groups.person_id
      AND people.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete person_groups for their people"
  ON person_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM people
      WHERE people.id = person_groups.person_id
      AND people.user_id = auth.uid()
    )
  );

-- Helper functions for shared group RLS (SECURITY DEFINER avoids circular policy references)
CREATE OR REPLACE FUNCTION is_person_in_shared_group(p_person_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM person_groups pg
    JOIN groups g ON g.id = pg.group_id
    WHERE pg.person_id = p_person_id
    AND g.share_code IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION is_person_group_in_shared_group(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM groups g
    WHERE g.id = p_group_id
    AND g.share_code IS NOT NULL
  );
$$;

-- Allow reading people that belong to a shared group (fixes empty shared groups)
CREATE POLICY "Public can view people in shared groups"
  ON people FOR SELECT
  USING (is_person_in_shared_group(id));

-- Allow reading person_groups for shared groups
CREATE POLICY "Public can view person_groups in shared groups"
  ON person_groups FOR SELECT
  USING (is_person_group_in_shared_group(group_id));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at on people
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Everyone can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
