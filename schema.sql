-- Database Schema for Birthminder App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table (for organizing people)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Person-Group junction table (many-to-many relationship)
CREATE TABLE person_groups (
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, group_id)
);

-- Indexes for better query performance
CREATE INDEX idx_people_user_id ON people(user_id);
CREATE INDEX idx_people_birthday ON people(birthday_month, birthday_day);
CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_person_groups_person ON person_groups(person_id);
CREATE INDEX idx_person_groups_group ON person_groups(group_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
